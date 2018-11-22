# implement training & prediction ML

import numpy as np
import pandas as pd
from sklearn import linear_model

def create_model(csv_url):
    data_set = pd.read_csv(csv_url)

    regression_model = linear_model.LinearRegression()


