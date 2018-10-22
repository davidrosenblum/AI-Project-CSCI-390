from sklearn import *
import pandas
import json
import os
import tornado.ioloop
from tornado.web import RequestHandler, Application


class MainHandler(RequestHandler):
    def get(self):
        self.write("Python API.")


class TrainingHandler(RequestHandler):
    def post(self):
        pass


class PredictionHandler(RequestHandler):
    def get(self):
        pass


if __name__ == "__main__":
    # debug?
    debug = True if os.environ["DEBUG"] == "true" else False

    # create tornado app with route handlers
    app = Application([
       (r"/", MainHandler),
       (r"/api/training", TrainingHandler),
       (r"/api/prediction", PredictionHandler)
    ], debug=debug)


    # listen on port
    port = os.environ["PORT"] if "port" in os.environ else 8082
    app.listen(port)

    # start
    tornado.ioloop.IOLoop.current().start()
    print("Http server listening on port {p}".format(p=port))