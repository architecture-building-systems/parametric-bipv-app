from flask import Flask, request, jsonify, render_template
import pandas as pd
import numpy as np
import os
from notebooks import datadict, devices

# Thanks:
# https://www.freecodecamp.org/news/how-to-build-a-web-application-using-flask-and-deploy-it-to-the-cloud-3551c985e492/

app = Flask(__name__, static_folder="static/")
# app.config["SESSION_TYPE"] = "filesystem"
app.secret_key = os.urandom(24)
# ALLOWED_EXTENSIONS = {".epw"}
# app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path,"uploads")
# app.config["SESSION_PERMANENT"] = False
# app.config["SESSION_TYPE"] = "filesystem"
# Session(app)
# CORS(app)



@app.route("/")
def home():
    return render_template("home.html", greetings="Hello, world!")

# @app.route("/about")
# def about():
#     return render_template("about.html")


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

    # for module in data.module_types:
    #     data.module_type_selected = module
    #     data.get_layers()
    #     base_dict[module] = {}
        
    #     for l in data.layers:
        
    #         data.layer_selected = l 
    #         data.get_layer_options()
    #         # if len(data.layer_options)<2:
    #         #     pass
    #         # else:
    #         base_dict[module][l] = data.layer_options

    for module in data.module_types:
        data.module_type_selected = module
        data.get_layers()
        base_dict[module] = {}
        
        for l in data.layers:
        
            data.layer_selected = l 
            data.get_layer_options()
            # if len(data.layer_options)<2:
            #     pass
            # else:
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

# # New route to receive selected data via POST
# @app.route('/generate_chart', methods=['POST'])
# def generate_chart():
#     selected_data = request.json  # Assuming data is sent as JSON in the request body
#     # Call your chart generation function with the selected data
#     chart_data = generate_chart_function(selected_data)
    
#     return jsonify(chart_data)


# def generate_chart_function(selected_data):
#     # Implement your chart generation logic using the selected data
#     # Example: Assume selected_data is a dictionary containing the chosen inputs and options
#     # You can use a plotting library like Matplotlib or Plotly to create charts
#     data = datadict.DataFile("notebooks/data_new_PV.json")
    
#     data.impact_value()
    
#     return chart_data


# @app.route("/download-morph-results")
# @cross_origin(supports_credentials=True)
# def get_results():

#     fileobj = io.BytesIO()
#     with zipfile.ZipFile(fileobj, 'w') as zip_file:
#         zip_info = zipfile.ZipInfo("Archive2.zip")
#         zip_info.date_time = time.localtime(time.time())[:6]
#         zip_info.compress_type = zipfile.ZIP_DEFLATED
#         for k,v in session.items():
#             if ".epw" in k:
#                 zip_file.writestr(k, v)
#     fileobj.seek(0)
#     filename = f"morphed_{session['project_name']}.zip"
#     session.clear()
#     return Response(fileobj.getvalue(),
#                     mimetype='application/zip',
#                     headers={'Content-Disposition': f"attachment;filename={filename}"})

# @app.route("/analysis")
# @cross_origin(supports_credentials=True)
# def analysis():
#     return render_template("analysis.html")


if __name__ == "__main__":
    app.run(debug=True)
