import json
import pandas as pd
from . import CORSHandler
from python.learning import create_model

class TrainingHandler(CORSHandler):
    def data_received(self, chunk):
        pass

    def post(self, *args, **kwargs):
        print(self.request.body)

        # load request body json
        data = json.loads(self.request.body)

        # extract values
        topic = data.get("topic", None)
        csv_data = data.get("csv", None)

        # make sure values exist
        if topic is None or csv_data is None:
            self.set_status(400)
            self.finish("Please provide a topic and csv in the body json.")
            return

        # load csv
        # pd.read_csv(csv_data)

        print(csv_data)

        self.finish("Training data received.")

