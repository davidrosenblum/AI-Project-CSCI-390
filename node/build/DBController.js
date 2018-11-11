"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DocumentLoader_1 = require("./DocumentLoader");
var DBController = (function () {
    function DBController(client, dbName) {
        this._database = client.db(dbName);
        this.createCollections();
    }
    DBController.prototype.createCollections = function () {
        this._database.createCollection("documents").catch(function (err) {
            console.log("Error creating collection.");
            throw err;
        });
    };
    DBController.prototype.insert = function (url, words) {
        var algorithm_revision = DocumentLoader_1.DocumentLoader.SCRAPE_ALGORITHM_REVISION;
        return this._database.collection("documents").insertOne({ url: url, words: words, algorithm_revision: algorithm_revision });
    };
    DBController.prototype.get = function (url) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._database.collection("documents").findOne({ url: url })
                .then(function (result) { return result ? resolve(result) : reject("No result for " + url); })
                .catch(function (err) { return reject(err); });
        });
    };
    return DBController;
}());
exports.DBController = DBController;
