"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var http = require("http");
var mongodb_1 = require("mongodb");
var DBController_1 = require("./DBController");
var DocumentLoader_1 = require("./DocumentLoader");
var CSVBuilder_1 = require("./CSVBuilder");
var WebServer = (function () {
    function WebServer() {
        this._app = express().use(express.static(__dirname + "/../react/build"));
        this._server = http.createServer(this._app);
        this._database = null;
        this.createRoutes();
        this.init();
    }
    WebServer.prototype.createRoutes = function () {
        var _this = this;
        this._app.get("/", function (req, res) { return res.sendFile("index.html"); });
        this._app.options("*", function (req, res) {
            res.writeHead(200, WebServer.HTTP_HEADERS);
            res.end();
        });
        this._app.post("/api/page/scrape", function (req, res) {
            _this.readHttpPost(req, function (err, json) {
                if (!err) {
                    if ("urls" in json && json.urls instanceof Array) {
                        var urls = json.urls;
                        if (urls.length === 1) {
                            _this.scrapePage(urls[0])
                                .then(function (resp) {
                                res.writeHead(200, WebServer.HTTP_HEADERS);
                                res.end(resp.message);
                            })
                                .catch(function (err) {
                                res.writeHead(400, WebServer.HTTP_HEADERS);
                                res.end(err.message);
                            });
                        }
                        else {
                            _this.scrapePages(urls).then(function (resp) {
                                res.writeHead(200, WebServer.HTTP_HEADERS);
                                res.end(resp.message);
                            });
                        }
                    }
                    else {
                        res.writeHead(400, WebServer.HTTP_HEADERS);
                        res.end("Error: urls must be an Array of strings specified in the json.");
                    }
                }
                else {
                    res.writeHead(400, WebServer.HTTP_HEADERS);
                    res.end("Error parsing json.");
                }
            });
        });
        this._app.get("/api/page/get/:url", function (req, res) {
            var url = decodeURIComponent(req.params.url);
            _this._database.get(url)
                .then(function (result) {
                res.writeHead(200, WebServer.HTTP_HEADERS);
                res.end(result);
            })
                .catch(function (err) {
                res.writeHead(400, WebServer.HTTP_HEADERS);
                res.end("Error: \"" + url + "\" not in database. (See API endpoint for loading it)");
            });
        });
        this._app.get("/api/page/csv", function (req, res) {
            if ("urls" in req.query) {
                var urls_1 = decodeURIComponent(req.query.urls).split(",");
                if (urls_1.length === 1) {
                    _this._database.get(urls_1[0])
                        .then(function (doc) {
                        res.writeHead(200, WebServer.HTTP_HEADERS);
                        res.end(CSVBuilder_1.CSVBuilder.makeCSV(doc));
                    })
                        .catch(function (err) {
                        res.writeHead(400, WebServer.HTTP_FILE_HEADERS);
                        res.end("Error: " + urls_1[0] + " not in database.");
                    });
                }
                else {
                    _this.getManyDBDocs(urls_1).then(function (docs) {
                        res.writeHead(200, WebServer.HTTP_FILE_HEADERS);
                        res.end(CSVBuilder_1.CSVBuilder.makeMergedCSV(docs));
                    });
                }
            }
            else {
                res.writeHead(400, WebServer.HTTP_HEADERS);
                res.end("Error: No URLs provided in query strings.");
            }
        });
        this._app.post("/api/train/:topic", function (req, res) {
            _this.readHttpPost(req, function (err, json) {
                if (!err) {
                    if ("urls" in json && json.urls instanceof Array) {
                        var urls = json.urls;
                        var topic = req.param("topic").toLowerCase();
                        _this.scrapePages(urls).then(function (report) {
                            if (!report.errs) {
                            }
                            else {
                                res.writeHead(400, WebServer.HTTP_HEADERS);
                                res.end("Error: " + report.errs + " urls could be scraped.");
                            }
                        });
                        res.writeHead(200, WebServer.HTTP_HEADERS);
                        res.end("Training is not yet implemented.");
                    }
                    else {
                        res.writeHead(400, WebServer.HTTP_HEADERS);
                        res.end("Error: urls must be an Array of strings specified in the json");
                    }
                }
                else {
                    res.writeHead(400, WebServer.HTTP_HEADERS);
                    res.end("Error parsing json.");
                }
            });
        });
    };
    WebServer.prototype.readHttpPost = function (req, cb) {
        var data = "";
        req.on("data", function (chunk) { return data += chunk; });
        req.on("error", function (err) { return cb(err); });
        req.on("end", function () {
            var json = null;
            try {
                json = JSON.parse(data);
            }
            catch (err) {
                cb(err);
                return;
            }
            cb(null, json || {});
        });
    };
    WebServer.prototype.pythonAPI = function (task, urls) {
        return new Promise(function (resolve, reject) {
            var options = {};
            var req = http.request(options, function (res) {
            });
            req.on("error", function (err) { return reject(err); });
        });
    };
    WebServer.prototype.getManyDBDocs = function (urls) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var numDone = 0;
            var results = [];
            urls.forEach(function (url) {
                _this._database.get(url)
                    .then(function (doc) {
                    results.push(doc);
                })
                    .catch(function (err) { })
                    .then(function () {
                    if (++numDone === urls.length) {
                        resolve(results);
                    }
                });
            });
        });
    };
    WebServer.prototype.scrapePage = function (url) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._database.get(url)
                .then(function (data) {
                if (data.algorithm_revision !== DocumentLoader_1.DocumentLoader.SCRAPE_ALGORITHM_REVISION) {
                    throw new Error("Revision error.");
                }
                else {
                    resolve({ message: url + " scraped (data was cached)." });
                }
            })
                .catch(function (err) {
                DocumentLoader_1.DocumentLoader.scrape(url)
                    .then(function (words) {
                    _this._database.insert(url, words);
                    resolve({ message: url + " scraped." });
                })
                    .catch(function (err) {
                    reject(err);
                });
            });
        });
    };
    WebServer.prototype.scrapePages = function (urls) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var numDone = 0;
            var errs = 0;
            urls.forEach(function (url) {
                _this.scrapePage(url)
                    .catch(function (err) { return errs++; })
                    .then(function () {
                    if (++numDone === urls.length) {
                        resolve({ message: numDone - errs + "/" + urls.length + " scraped.", errs: errs });
                    }
                });
            });
        });
    };
    WebServer.prototype.init = function () {
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
    WebServer.HTTP_FILE_HEADERS = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Origin",
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=data.csv"
    };
    return WebServer;
}());
exports.WebServer = WebServer;
if (require.main === module) {
    new WebServer();
}
