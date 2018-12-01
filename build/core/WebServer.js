"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var http = require("http");
var fs = require("fs");
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
    WebServer.prototype.loadSettings = function (callback) {
        fs.readFile(WebServer.SETTINGS_PATH, function (err, data) {
            if (!err) {
                var settings = JSON.parse(data.toString());
                for (var setting in WebServer.DEFAULT_SETTINGS) {
                    if (typeof settings[setting] !== typeof WebServer.DEFAULT_SETTINGS[setting]) {
                        settings[setting] = WebServer.DEFAULT_SETTINGS[setting];
                    }
                }
                callback(null, settings);
            }
            else {
                var defaultSettingsCopy_1 = Object.assign({}, WebServer.DEFAULT_SETTINGS);
                if (err.errno === -4058) {
                    fs.writeFile(WebServer.SETTINGS_PATH, JSON.stringify(WebServer.DEFAULT_SETTINGS, null, 4), function () {
                        callback(null, defaultSettingsCopy_1);
                    });
                }
                else
                    callback(err, defaultSettingsCopy_1);
            }
        });
    };
    WebServer.prototype.init = function (callback) {
        var _this = this;
        console.log("AI Project - WebServer\n");
        console.log("Loading settings...");
        this.loadSettings(function (err, settings) {
            if (settings) {
                console.log("Settings loaded.\n");
                var mongoUrl = process.env.MONGO_URL || settings.mongo_url;
                var mongoDb_1 = process.env.MONGO_DB || settings.mongo_database;
                console.log("Connecting to database...");
                mongodb_1.MongoClient.connect(mongoUrl, { useNewUrlParser: true }, function (err, db) {
                    if (!err) {
                        console.log("Connected.\n");
                        _this._database = new DBController_1.DBController(db, mongoDb_1);
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
            }
            else {
                console.log("Settings file error.");
                console.log(err.message);
                console.log("WARNING: using default settings instead of exiting.");
            }
        });
    };
    WebServer.HTTP_HEADERS = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Origin"
    };
    WebServer.DEFAULT_SETTINGS = {
        "mongo_url": "mongodb://localhost:27017",
        "mongo_database": "ai_proj"
    };
    WebServer.SETTINGS_PATH = "settings.json";
    return WebServer;
}());
exports.WebServer = WebServer;
if (require.main === module) {
    new WebServer();
}
