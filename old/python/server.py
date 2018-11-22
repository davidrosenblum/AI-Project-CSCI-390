import os
import tornado.web
import tornado.httpserver
import tornado.ioloop
from python.handlers import MainHandler, PredictionHandler, TrainingHandler

# create the tornado application
# sets up route request handlers 
app = tornado.web.Application([
    (r"/", MainHandler),
    (r"/api/predict", PredictionHandler),
    (r"/api/train", TrainingHandler)
], debug=bool(os.environ.get("debug", False)))

# create the web server
server = tornado.httpserver.HTTPServer(app)

# main method - starts the program 
if __name__ == "__main__":
    # server listen on a port
    port = int(os.environ.get("port", 8081))
    server.listen(port)
    print("HTTP server listening on port {p}".format(p=port))

    # begin tornado
    tornado.ioloop.IOLoop.current().start()