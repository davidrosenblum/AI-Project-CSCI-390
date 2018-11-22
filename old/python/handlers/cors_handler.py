import tornado.web

class CORSHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Origin")
        self.set_header("Access-Control-Allow-Methods", "OPTIONS, POST, GET")

    def options(self, *args, **kwargs):
        self.set_status(204)
        self.finish()
