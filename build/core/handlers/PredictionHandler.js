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
    PredictionHandler.prototype.createTrainingModel = function (trainingData) {
        var model = tf.sequential();
        model.compile({ loss: "meanSquaredError", optimizer: "sgd" });
        return model;
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
                    var topic_1 = json.topic, urls = json.urls;
                    _this._database.findMany(urls).then(function () {
                        _this._database.findTrainingData(topic_1)
                            .then(function (trainingData) {
                            var model = _this.createTrainingModel(trainingData);
                        })
                            .catch(function (err) {
                            res.writeHead(400, RequestHandler_1.RequestHandler.CORS_HEADERS);
                            res.end("Model for topic \"" + topic_1 + "\" does not exist.");
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
    return PredictionHandler;
}(RequestHandler_1.RequestHandler));
exports.PredictionHandler = PredictionHandler;
exports.default = new PredictionHandler();
