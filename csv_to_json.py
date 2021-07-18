import pandas as pd
import os


df = pd.read_csv("inflation_data.csv")
folder_path = os.path.join("src", "data")
if not os.path.exists(folder_path):
    os.mkdir(folder_path)
file_path = os.path.join(folder_path, "inflationData.json")
df.to_json(file_path, orient="index")
