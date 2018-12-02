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
var DocumentLoader_1 = require("../DocumentLoader");
var ScrapeHandler = (function (_super) {
    __extends(ScrapeHandler, _super);
    function ScrapeHandler() {
        var _this = _super.call(this) || this;
        _this._database = null;
        return _this;
    }
    ScrapeHandler.prototype.scrapePage = function (url) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._database.find(url.trim())
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
    ScrapeHandler.prototype.scrapePages = function (urls) {
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
    ScrapeHandler.prototype.database = function (db) {
        this._database = db;
        return this;
    };
    ScrapeHandler.prototype.post = function (req, res) {
        var _this = this;
        this.loadPostBody(req, function (err, json) {
            if (!err) {
                if ("urls" in json && json.urls instanceof Array) {
                    var urls = json.urls.map(function (url) { return url.trim(); });
                    if (urls.length === 1) {
                        _this.scrapePage(urls[0])
                            .then(function (resp) {
                            res.writeHead(200, RequestHandler_1.RequestHandler.CORS_HEADERS);
                            res.end(resp.message);
                        })
                            .catch(function (err) {
                            res.writeHead(400, RequestHandler_1.RequestHandler.CORS_HEADERS);
                            res.end(err.message);
                        });
                    }
                    else {
                        _this.scrapePages(urls).then(function (resp) {
                            res.writeHead(200, RequestHandler_1.RequestHandler.CORS_HEADERS);
                            res.end(resp.message);
                        });
                    }
                }
                else {
                    res.writeHead(400, RequestHandler_1.RequestHandler.CORS_HEADERS);
                    res.end("Error: urls must be an Array of strings specified in the json.");
                }
            }
            else {
                res.writeHead(400, RequestHandler_1.RequestHandler.CORS_HEADERS);
                res.end("Error parsing json.");
            }
        });
    };
    return ScrapeHandler;
}(RequestHandler_1.RequestHandler));
exports.ScrapeHandler = ScrapeHandler;
exports.default = new ScrapeHandler();
