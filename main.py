from flask import Flask, request, jsonify, render_template
import pandas as pd
import numpy as np
import os
from notebooks import datadict, devices

# Thanks:
# https://www.freecodecamp.org/news/how-to-build-a-web-application-using-flask-and-deploy-it-to-the-cloud-3551c985e492/

app = Flask(__name__, static_folder="static/")
app.secret_key = os.urandom(24)


@app.route("/")
def home():
    return render_template("home.html", greetings="Hello, world!")

@app.route("/calculator", methods=["GET", "POST"])
def calculator():
    # session.clear()
    if request.method == "POST":
        result_files = {"app": "calculator"}
        return jsonify(result_files)
    return render_template("calculator.html")


# New route to fetch technology-specific form data
@app.route('/get_form_data/<technology>')
def get_form_data(technology):
    data = datadict.DataFile("static/data/pv_data.json")
    base_dict = {}
    
    for module in data.module_types:
        data.module_type_selected = module
        data.get_layers()
        base_dict[module] = {}
        
        for l in data.layers:
        
            data.layer_selected = l 
            data.get_layer_options()
            
            base_dict[module][l] = {}
            base_dict[module][l]['Options'] = data.layer_options
            
            layer_option_locations = {}
            for option in data.layer_options:
                data.layer_option_selected = option
                data.get_locations()
                layer_option_locations[option] = data.locations
                
            base_dict[module][l]['Locations Per Option'] = layer_option_locations
    
    technology_data = base_dict[technology]
    return jsonify(technology_data)

if __name__ == "__main__":
    app.run(host='localhost', port = 5000, debug=False)
