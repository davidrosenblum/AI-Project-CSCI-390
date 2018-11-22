"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CSVBuilder = (function () {
    function CSVBuilder() {
    }
    CSVBuilder.aggregateWordDictionary = function (docs) {
        var aggregateWords = {};
        docs.forEach(function (doc) {
            for (var word in doc.words) {
                if (word in aggregateWords) {
                    aggregateWords[word]++;
                }
                else {
                    aggregateWords[word] = 1;
                }
            }
        });
        return aggregateWords;
    };
    CSVBuilder.makeMergedCSV = function (docs) {
        var aggregateWords = CSVBuilder.aggregateWordDictionary(docs);
        var combinedDoc = {
            url: null,
            words: aggregateWords,
            algorithm_revision: 0
        };
        return CSVBuilder.makeCSV(combinedDoc);
    };
    CSVBuilder.makeCSV = function (doc) {
        var words = [], counts = [];
        for (var word in doc.words) {
            words.push(word);
            counts.push(doc.words[word]);
        }
        return words.join(",") + "\n" + counts.join(",");
    };
    return CSVBuilder;
}());
exports.CSVBuilder = CSVBuilder;
