"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var https = require("https");
var cheerio = require("cheerio");
var DocumentLoader = (function () {
    function DocumentLoader() {
    }
    DocumentLoader.parse = function (text) {
        var dict = {};
        text.replace(/\s|\.|\s+/gi, " ").split(" ").forEach(function (word) {
            if (word.length < 3)
                return;
            if (word in dict) {
                dict[word]++;
            }
            else {
                dict[word] = 1;
            }
        });
        return dict;
    };
    DocumentLoader.scrape = function (url) {
        return new Promise(function (resolve, reject) {
            var req = https.get(url, function (res) {
                var data = "";
                res.on("data", function (chunk) { return data += chunk; });
                res.on("end", function () {
                    var $ = cheerio.load(data);
                    var body = $("body").text();
                    var words = DocumentLoader.parse(body);
                    resolve(words);
                });
            });
            req.on("error", function (err) { return reject(err); });
        });
    };
    DocumentLoader.SCRAPE_ALGORITHM_REVISION = 2;
    return DocumentLoader;
}());
exports.DocumentLoader = DocumentLoader;
