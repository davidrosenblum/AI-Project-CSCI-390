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
var CSVHandler = (function (_super) {
    __extends(CSVHandler, _super);
    function CSVHandler() {
        var _this = _super.call(this) || this;
        _this._database = null;
        return _this;
    }
    CSVHandler.prototype.makeCSV = function (urls) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (urls.length === 1) {
                _this._database.find(urls[0])
                    .then(function (doc) { return resolve(CSVBuilder_1.CSVBuilder.makeCSV(doc)); })
                    .catch(function (err) { return reject(err); });
            }
            else {
                _this._database.findMany(urls).then(function (docs) {
                    resolve(CSVBuilder_1.CSVBuilder.makeMergedCSV(docs));
                });
            }
        });
    };
    CSVHandler.prototype.database = function (db) {
        this._database = db;
        return this;
    };
    CSVHandler.prototype.get = function (req, res) {
        if ("urls" in req.query) {
            var urls = decodeURIComponent(req.query.urls).split(",");
            this.makeCSV(urls)
                .then(function (csv) {
                var headers = Object.assign(RequestHandler_1.RequestHandler.CORS_HEADERS, {});
                headers["Content-Disposition"] = "attachment; filename=data.csv";
                headers["Content-Type"] = "text/csv";
                res.writeHead(200, headers);
                res.end(csv);
            })
                .catch(function (err) {
                res.writeHead(400, RequestHandler_1.RequestHandler.CORS_HEADERS);
                res.end("Error: " + err.message + ".");
            });
        }
        else {
            res.writeHead(400, RequestHandler_1.RequestHandler.CORS_HEADERS);
            res.end("Error: No URLs provided in query strings.");
        }
    };
    return CSVHandler;
}(RequestHandler_1.RequestHandler));
exports.CSVHandler = CSVHandler;
;
exports.default = new CSVHandler();
