from pyepwmorph.tools import io as morph_io
from pyepwmorph.tools import configuration as morph_config
from pyepwmorph.tools import workflow as morph_workflows
import zipfile
import io
import os
import random
import string
import time

MODEL_SOURCES = ['ACCESS-CM2', 'CanESM5', 'TaiESM1']


def calc_period(year, period):
    extent = int(period[1]) - int(period[0])
    return int(year - (extent/2)), int(year + (extent/2))
    

def intake_form(form_data, uploaded_file):
    
    # {'project-name': 'new_project', 
    #  'baseline-period': '50', 
    #  'use-epw': 'True', 
    #  'climate-pathways': 'Middle of the Road', 
    #  'future-years': '2030,2050', 
    #  'percentiles': '1', 
    #  'variables': 'tas'}
    
    # get project_name
    project_name = form_data.get('project-name')
    
    # get variables
    user_variables = form_data.getlist('variables')
    
    # get pathways
    user_pathways = form_data.getlist('climate-pathways')
    
    # get percentiles
    percentiles = [int(percentile) for percentile in form_data.getlist('percentiles')]
    
    if bool(form_data.getlist('use-epw')) == True:
        baseline = None
    else:
        baseline = form_data.get('hidden-baseline-range').split(",")
        baseline = (int(baseline[0]),int(baseline[1]))        
    
    config_object = morph_config.MorphConfig(project_name, uploaded_file, MODEL_SOURCES, user_variables, user_pathways, percentiles, None, baseline_range=baseline)
    os.remove(uploaded_file)
    
    # get future years
    config_object.future_years = [int(year) for year in form_data.get('future-years').split(",")]
    config_object.future_ranges = [calc_period(int(year), config_object.baseline_range) for year in config_object.future_years] 

    return config_object
    


def morphing_workflow(config_object):
    result_data = {}
    for fut_year in config_object.future_years:
        fut_key = str(fut_year)
        result_data[fut_key] = {}
        future_range = calc_period(int(fut_year), config_object.baseline_range)
        # get climate model data
        year_model_dict = morph_workflows.iterate_compile_model_data(config_object.model_pathways,
                                                   config_object.model_variables,
                                                   config_object.model_sources,
                                                   config_object.epw.location['longitude'],
                                                   config_object.epw.location['latitude'],
                                                   config_object.percentiles)
        for pathway in [pathway for pathway in config_object.model_pathways if pathway!="historical"]:
            result_data[fut_key][pathway] = {}
            for percentile in config_object.percentiles:
                percentile_key = str(percentile)
                morphed_data = morph_workflows.morph_epw(config_object.epw,
                                        config_object.user_variables,
                                        config_object.baseline_range,
                                        future_range,
                                        year_model_dict,
                                        pathway,
                                        percentile)
                result_data[fut_key][pathway][percentile_key] = morphed_data
                
    return result_data


def write_result_epws(config_object, result_data):
    years = result_data.keys()
    pathways = []
    for year in years:
        pathways += (list(result_data[year]))
    pathways = list(set(pathways))  

    percentiles = []
    for year in years:
        for pathway in pathways:
            percentiles += (list(result_data[year][pathway]))
    percentiles = list(set(percentiles))    
    
    # file_name = ''.join(random.choices(string.ascii_uppercase + string.digits, k=42))
    # fileobj = os.path.join("uploads",f"morphed_{config_object.project_name}_{file_name}.zip")
    # fileobj = io.BytesIO()
    # with zipfile.ZipFile(fileobj, 'w') as zip_file:
    #     zip_info = zipfile.ZipInfo("morphed.zip")
    #     zip_info.date_time = time.localtime(time.time())[:6]
    #     zip_info.compress_type = zipfile.ZIP_DEFLATED
    
    result_files = {}
    for year in years:
        for pathway in pathways:
            for percentile in percentiles:
                file_name = f"morphed_{config_object.project_name}_{year}_{pathway}_{percentile}.epw"
                string_data = result_data[year][pathway][percentile].make_epw_string()
                result_files[file_name] = string_data
                    
    
    return result_files
