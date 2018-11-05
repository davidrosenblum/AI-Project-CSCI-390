from . import CORSHandler

class TrainingHandler(CORSHandler):
    def data_received(self, chunk):
        pass

    def post(self, *args, **kwargs):
        self.finish("Training data received.")
