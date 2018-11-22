from . import CORSHandler

class PredictionHandler(CORSHandler):
    def data_received(self, chunk):
        pass

    def get(self, *args, **kwargs):
        # extract query string parameters
        topic = self.get_argument("topic", None)
        urls = self.get_argument("urls", None)

        # enforce topic parameter
        if topic is None:
            self.set_status(400)
            self.finish("Missing topic query string.")
            return

        # enforce urls parameter
        if urls is None or len(urls) == 0:
            self.set_status(400)
            self.finish("Missing URLs query string.")
            return

        # use model logic