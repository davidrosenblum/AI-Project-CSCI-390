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
var RequestHandler_1 = require("./RequestHandler");
var CSVBuilder_1 = require("../../utils/CSVBuilder");
var TrainingHandler = (function (_super) {
    __extends(TrainingHandler, _super);
    function TrainingHandler() {
        var _this = _super.call(this) || this;
        _this._database = null;
        return _this;
    }
    TrainingHandler.prototype.createTrainingData = function (topic, docs) {
        var aggregateWords = CSVBuilder_1.CSVBuilder.aggregateWordDictionary(docs);
        var trainX = [];
        var trainY = [];
        for (var word in aggregateWords) {
            trainX.push(word);
            trainY.push(aggregateWords[word]);
        }
        return { topic: topic, trainX: trainX, trainY: trainY };
    };
    TrainingHandler.prototype.database = function (db) {
        this._database = db;
        return this;
    };
    TrainingHandler.prototype.post = function (req, res) {
        var _this = this;
        this.loadPostBody(req, function (err, json) {
            if (!err) {
                if ("topic" in json && "urls" in json) {
                    var topic_1 = json.topic, urls_1 = json.urls;
                    _this._database.findTrainingData(topic_1)
                        .then(function (model) {
                        res.writeHead(400, RequestHandler_1.RequestHandler.CORS_HEADERS);
                        res.end("Training model already exists for topic \"" + topic_1 + "\"");
                    })
                        .catch(function (err) {
                        _this._database.findMany(urls_1).then(function (docs) {
                            var model = _this.createTrainingData(topic_1, docs);
                            _this._database.insertTrainingData(model)
                                .then(function () {
                                res.writeHead(200, RequestHandler_1.RequestHandler.CORS_HEADERS);
                                res.end("Training model for topic \"" + topic_1 + "\" saved.");
                            })
                                .catch(function (err) {
                                res.writeHead(400, RequestHandler_1.RequestHandler.CORS_HEADERS);
                                res.end("Error saving training model. " + err);
                            });
                        });
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
    return TrainingHandler;
}(RequestHandler_1.RequestHandler));
exports.TrainingHandler = TrainingHandler;
exports.default = new TrainingHandler();
