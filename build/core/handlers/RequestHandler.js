"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestHandler = (function () {
    function RequestHandler() {
    }
    RequestHandler.prototype.loadPostBody = function (req, cb) {
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
    RequestHandler.HTTP_HEADERS = {};
    RequestHandler.CORS_HEADERS = {
        "Access-Control-Allow-Headers": "Access-Control-Allow-Origin",
        "Access-Control-Allow-Origin": "*"
    };
    return RequestHandler;
}());
exports.RequestHandler = RequestHandler;
