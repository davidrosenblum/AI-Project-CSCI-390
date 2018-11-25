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
var RequestHandler_1 = require("./RequestHandler");
var PredictionHandler = (function (_super) {
    __extends(PredictionHandler, _super);
    function PredictionHandler() {
        var _this = _super.call(this) || this;
        _this._database = null;
        return _this;
    }
    PredictionHandler.prototype.predictPage = function (doc, model, results) {
        var testData = this.getTestData(doc.words);
        var xValues = testData.xValues, yValues = testData.yValues;
        var testXs = tf.tensor(xValues);
        var testYs = tf.tensor(yValues);
        results[doc.url] = true;
    };
    PredictionHandler.prototype.linearRegressionModel = function () {
        var model = tf.sequential();
        var layer = tf.layers.dense({ units: 1, inputShape: [1] });
        model.add(layer);
        model.compile({ loss: "meanSquaredError", optimizer: "sgd" });
        return model;
    };
    PredictionHandler.prototype.getTestData = function (wordDict) {
        var xValues = [];
        var yValues = [];
        for (var word in wordDict) {
            xValues.push(word.charCodeAt(0));
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
                    _this._database.findTrainingData(topic_1)
                        .then(function (trainingData) {
                        _this._database.findMany(urls_1).then(function (docs) {
                            if (docs.length < urls_1.length) {
                                console.log("Prediction 'error': " + urls_1.length + " docs, got " + docs.length + ".");
                            }
                            var model = _this.linearRegressionModel();
                            var trainXs = tf.tensor(trainingData.trainX.map(function (word) { return word.charCodeAt(0); }));
                            var trainYs = tf.tensor(trainingData.trainY);
                            var results = {};
                            model.fit(trainXs, trainYs).then(function () {
                                docs.forEach(function (doc) { return _this.predictPage(doc, model, results); });
                                res.writeHead(200, RequestHandler_1.RequestHandler.CORS_HEADERS);
                                res.end(JSON.stringify(results));
                            });
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
