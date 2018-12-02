"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var tf = require("@tensorflow/tfjs");
var fs = require("fs");
var RequestHandler_1 = require("./RequestHandler");
var LEARNING_RATE = 0.000001;
var PredictionHandler = (function (_super) {
    __extends(PredictionHandler, _super);
    function PredictionHandler() {
        var _this = _super.call(this) || this;
        _this._database = null;
        return _this;
    }
    PredictionHandler.prototype.predictPage = function (doc, wordIDs, fittedModel, results) {
        var _a = this.extractTestData(doc.words), xValues = _a.xValues, yValues = _a.yValues;
        var wordIDsInTestSet = {};
        xValues.forEach(function (word, index) { return wordIDsInTestSet[wordIDs[word]] = yValues[index]; });
        var testableXs = [];
        var testableYs = [];
        for (var word in wordIDsInTestSet) {
            if (word in wordIDs) {
                testableXs.push(wordIDs[word]);
                testableYs.push(wordIDsInTestSet[word]);
            }
        }
        if (process.env.FILE_DEBUG === "true") {
            fs.writeFile("./test_outputs/test_" + Date.now() + ".json", JSON.stringify({ testableXs: testableXs, testableYs: testableYs }, null, 4), function (err) {
                if (err)
                    console.log(err.message);
            });
        }
        var testXs = tf.tensor2d(testableXs, [testableXs.length, 1]);
        var testYs = tf.tensor2d(testableYs, [testableYs.length, 1]);
        if (process.env.PRINT_SCORES === "true") {
            console.log('\neval y', fittedModel.evaluate(testXs, testYs).toString());
            console.log('\nprediction y', fittedModel.predict(testXs).toString());
            console.log('\ntest y', testYs.toString());
        }
        var score = parseFloat(fittedModel.evaluate(testXs, testYs)['dataSync']());
        console.log(doc.url + " score = " + score + ".");
        results[doc.url] = isNaN(score) ? true : score >= 1;
    };
    PredictionHandler.prototype.trainAndTest = function (trainingSet, docs) {
        var _this = this;
        return new Promise(function (resolve) {
            var _a = _this.concatTrainingData(trainingSet), xData = _a.xData, yData = _a.yData;
            var wordIDs = _this.createWordIDsDict(xData);
            var trainXArray = [];
            var trainYArray = [];
            xData.forEach(function (word, index) {
                trainXArray.push(wordIDs[word]);
                trainYArray.push(yData[index]);
            });
            var trainXs = tf.tensor2d(trainXArray, [trainXArray.length, 1]);
            var trainYs = tf.tensor2d(trainYArray, [trainYArray.length, 1]);
            if (process.env.FILE_DEBUG === "true") {
                fs.writeFile("./test_outputs/train_" + Date.now() + ".json", JSON.stringify({ trainXArray: trainXArray, trainYArray: trainYArray }, null, 4), function (err) {
                    if (err)
                        console.log(err.message);
                });
            }
            var results = {};
            var model = _this.linearRegressionModel();
            model.fit(trainXs, trainYs).then(function () {
                docs.forEach(function (doc) { return _this.predictPage(doc, wordIDs, model, results); });
                resolve(results);
            });
        });
    };
    PredictionHandler.prototype.concatTrainingData = function (trainingSet) {
        var xData = [];
        var yData = [];
        trainingSet.trainX.forEach(function (xs) { return xData = xData.concat(xs); });
        trainingSet.trainY.forEach(function (ys) { return yData = yData.concat(ys); });
        return { xData: xData, yData: yData };
    };
    PredictionHandler.prototype.createWordIDsDict = function (words) {
        var wordIDs = {};
        var lastWordID = 0;
        words.forEach(function (word) {
            if (word in wordIDs === false) {
                wordIDs[word] = ++lastWordID;
            }
        });
        return wordIDs;
    };
    PredictionHandler.prototype.linearRegressionModel = function () {
        var model = tf.sequential();
        model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
        model.compile({ loss: "meanSquaredError", optimizer: tf.train.sgd(LEARNING_RATE) });
        return model;
    };
    PredictionHandler.prototype.extractTestData = function (wordDict) {
        var xValues = [];
        var yValues = [];
        for (var word in wordDict) {
            xValues.push(word);
            yValues.push(wordDict[word]);
        }
        return { xValues: xValues, yValues: yValues };
    };
    PredictionHandler.prototype.database = function (db) {
        this._database = db;
        return this;
    };
    PredictionHandler.prototype.post = function (req, res) {
        var _this = this;
        this.loadPostBody(req, function (err, json) {
            if (!err) {
                if ("topic" in json && "urls" in json) {
                    var topic_1 = json.topic, urls_1 = json.urls;
                    _this._database.findTrainingSet(topic_1)
                        .then(function (trainingSet) {
                        _this._database.findMany(urls_1.map(function (url) { return url.trim(); })).then(function (docs) {
                            var warnings = "";
                            if (docs.length < urls_1.length) {
                                console.log("Prediction 'error': " + urls_1.length + " docs, got " + docs.length + ".");
                                warnings += "\nWarning: showing results for " + docs.length + "/" + urls_1.length + " urls (scrape pages first!).\n";
                            }
                            if (docs.length > 0) {
                                _this.trainAndTest(trainingSet, docs).then(function (results) {
                                    res.writeHead(200, RequestHandler_1.RequestHandler.CORS_HEADERS);
                                    res.end(JSON.stringify(results, null, 4));
                                });
                            }
                            else {
                                res.writeHead(400, RequestHandler_1.RequestHandler.CORS_HEADERS);
                                res.end("None of the " + urls_1.length + " documents were retrieved (try scraping them).");
                            }
                        });
                    })
                        .catch(function (err) {
                        res.writeHead(400, RequestHandler_1.RequestHandler.CORS_HEADERS);
                        res.end("Training data for topic \"" + topic_1 + "\" does not exist.");
                    });
                }
                else {
                    res.writeHead(400, RequestHandler_1.RequestHandler.CORS_HEADERS);
                    res.end("Error json body must include topics string and urls string array.");
                }
            }
            else {
                res.writeHead(400, RequestHandler_1.RequestHandler.CORS_HEADERS);
                res.end("Error parsing json.");
            }
        });
    };
    return PredictionHandler;
}(RequestHandler_1.RequestHandler));
exports.PredictionHandler = PredictionHandler;
exports.default = new PredictionHandler();
