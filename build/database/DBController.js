"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DocumentLoader_1 = require("../core/DocumentLoader");
var DBController = (function () {
    function DBController(client, dbName) {
        this._database = client.db(dbName);
        this.createCollections();
    }
    DBController.prototype.createCollections = function () {
        var _this = this;
        this._database.createCollection("documents").catch(function (err) {
            console.log("Error creating documents collection.");
            throw err;
        }).then(function () { return _this._database.collection("documents").createIndex({ url: 1 }); }).catch(function (err) { });
        this._database.createCollection("training").catch(function (err) {
            console.log("Error creating training collection");
            throw err;
        }).then(function () { return _this._database.collection("training").createIndex({ topic: 1 }).catch(function (err) { }); });
    };
    DBController.prototype.insertTrainingData = function (model) {
        return this._database.collection("training").insertOne(model);
    };
    DBController.prototype.findTrainingData = function (topic) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._database.collection("training").findOne({ topic: topic })
                .then(function (result) { return result ? resolve(result) : reject(new Error("No result for " + topic)); })
                .catch(function (err) { return reject(err); });
        });
    };
    DBController.prototype.insert = function (url, words) {
        var algorithm_revision = DocumentLoader_1.DocumentLoader.SCRAPE_ALGORITHM_REVISION;
        return this._database.collection("documents").insertOne({ url: url, words: words, algorithm_revision: algorithm_revision });
    };
    DBController.prototype.find = function (url) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._database.collection("documents").findOne({ url: url })
                .then(function (result) { return result ? resolve(result) : reject(new Error("No result for " + url)); })
                .catch(function (err) { return reject(err); });
        });
    };
    DBController.prototype.findMany = function (urls) {
        var _this = this;
        return new Promise(function (resolve) {
            var numDone = 0;
            var results = [];
            urls.forEach(function (url) {
                _this.find(url)
                    .then(function (doc) { return results.push(doc); })
                    .catch(function (err) { })
                    .then(function () {
                    if (++numDone === urls.length) {
                        resolve(results);
                    }
                });
            });
        });
    };
    return DBController;
}());
exports.DBController = DBController;
