"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var http = require("http");
var mongodb_1 = require("mongodb");
var DBController_1 = require("../database/DBController");
var CSVHandler_1 = require("./handlers/CSVHandler");
var ScrapeHandler_1 = require("./handlers/ScrapeHandler");
var TrainingHandler_1 = require("./handlers/TrainingHandler");
var PredictionHandler_1 = require("./handlers/PredictionHandler");
var WebServer = (function () {
    function WebServer() {
        var _this = this;
        this._app = express().use(express.static(__dirname + "/../../web/build"));
        this._server = http.createServer(this._app);
        this._database = null;
        this.init(function () { return _this.createRoutes(); });
    }
    WebServer.prototype.createRoutes = function () {
        this._app.get("/", function (req, res) { return res.sendFile("index.html"); });
        this._app.options("*", function (req, res) {
            res.writeHead(200, WebServer.HTTP_HEADERS);
            res.end();
        });
        this._app.post("/api/page/scrape", ScrapeHandler_1.default.database(this._database).post.bind(ScrapeHandler_1.default));
        this._app.get("/api/page/csv", CSVHandler_1.default.database(this._database).get.bind(CSVHandler_1.default));
        this._app.post("/api/train", TrainingHandler_1.default.database(this._database).post.bind(TrainingHandler_1.default));
        this._app.post("/api/predict", PredictionHandler_1.default.database(this._database).post.bind(PredictionHandler_1.default));
    };
    WebServer.prototype.init = function (callback) {
        var _this = this;
        console.log("AI Project - WebServer\n");
        var url = process.env.MONGDB_URL || "mongodb://localhost:27017";
        var dbName = process.env.MONGDB_DB || "ai_proj";
        console.log("Connecting to MongoDB...");
        mongodb_1.MongoClient.connect(url, function (err, db) {
            if (!err) {
                console.log("Connected to MongoDB.\n");
                _this._database = new DBController_1.DBController(db, dbName);
                var port_1 = parseInt(process.env.PORT) || 8080;
                _this._server.listen(port_1, function () {
                    console.log("Http server listening on port " + port_1 + ".\n");
                    callback();
                });
            }
            else {
                console.log(err.message);
                process.exit();
            }
        });
    };
    WebServer.HTTP_HEADERS = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Origin"
    };
    return WebServer;
}());
exports.WebServer = WebServer;
if (require.main === module) {
    new WebServer();
}
