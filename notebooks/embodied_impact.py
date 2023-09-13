import json
from matplotlib import pyplot as plt
import matplotlib
import numpy as np
import plotly.express as px

f = open('data.json')
data = json.load(f)


climate_change = []
fossil_energy = []
agricultural_land_occupation = []
ozone_depletion = []
terrestrial_acidification = []
photochemical_oxidant_formation = []
metal_depletion = []
water_depletion = []
freshwater_ecotoxicity = []
human_toxicity = []
urban_land_occupation = []
particulate_matter_formation = []
freshwater_eutrophication = []
natural_land_transformation = []
marine_eutrophication = []
ionising_radiation = []

panel_type = []
for type in data:
    panel_type.append(type)
    print(type)
panel_selected = str(input("Insert pynel type: "))

#front cover
print("Possible front cover types")
for key in data[panel_selected]["Front cover"]:    
    print(key)
front_cover_selected = str(input("Insert front cover type: "))
print("Available locations")
for key in data[panel_selected]["Front cover"][front_cover_selected]["Location"]:
    print(key)
front_cover_selected_location = str(input("Insert the location for the front cover: "))

#cell
print("Possible cell production locations")
for key in data[panel_selected]["Cell"]["cell"]["Location"]:
    print(key)
cell_selected_location = str(input("Insert the production location for the cell: "))

def categories(x, y, z, i):
    climate_change.append(data[x][str(i)][y]["Location"][z]["climate change"])
    fossil_energy.append(data[x][str(i)][y]["Location"][z]["fossil"])
    agricultural_land_occupation.append(data[x][str(i)][y]["Location"][z]["agricultural land occupation"])
    ozone_depletion.append(data[x][str(i)][y]["Location"][z]["ozone depletion"])
    terrestrial_acidification.append(data[x][str(i)][y]["Location"][z]["terrestrial acidification"])
    photochemical_oxidant_formation.append(data[x][str(i)][y]["Location"][z]["photochemical oxidant formation"])
    metal_depletion.append(data[x][str(i)][y]["Location"][z]["metal depletion"])
    water_depletion.append(data[x][str(i)][y]["Location"][z]["water depletion"])
    freshwater_ecotoxicity.append(data[x][str(i)][y]["Location"][z]["freshwater ecotoxicity"])
    human_toxicity.append(data[x][str(i)][y]["Location"][z]["human toxicity"])
    urban_land_occupation.append(data[x][str(i)][y]["Location"][z]["urban land occupation"])
    particulate_matter_formation.append(data[x][str(i)][y]["Location"][z]["particulate matter formation"])
    freshwater_eutrophication.append(data[x][str(i)][y]["Location"][z]["freshwater eutrophication"])
    natural_land_transformation.append(data[x][str(i)][y]["Location"][z]["natural land transformation"])
    marine_eutrophication.append(data[x][str(i)][y]["Location"][z]["marine eutrophication"])
    ionising_radiation.append(data[x][str(i)][y]["Location"][z]["ionising radiation"])

#Encapsulant
print("Possible encapsulant types")
for key in data[panel_selected]["Encapsulant"]:    
    print(key)
encapsulant_selected = str(input("Insert encapsulant type: "))
print("Available locations")
for key in data[panel_selected]["Encapsulant"][encapsulant_selected]["Location"]:
    print(key)
encapsulant_selected_location = str(input("Insert the production location for encapsulant: "))

#Back cover
print("Possible back surface types")
for key in data[panel_selected]["Rear cover"]:    
    print(key)
rear_surface_selected = str(input("Insert rear surface type: "))
print("Available locations")
for key in data[panel_selected]["Rear cover"][rear_surface_selected]["Location"]:
    print(key)
rear_cover_selected_location = str(input("Insert the production location for rear cover: "))

#Wires
print("Possible wire types")
for key in data[panel_selected]["Wires"]:    
    print(key)
wires_selected = str(input("Insert wire type: "))
print("Available locations")
for key in data[panel_selected]["Wires"][wires_selected]["Location"]:
    print(key)
wires_selected_location = str(input("Insert the production location for rear cover: "))

#Mounting system
print("Possible Mounting systems")
for key in data[panel_selected]["Mounting system"]:    
    print(key)
mounting_system_selected = str(input("Insert Mounting system type: "))
print("Available locations")
for key in data[panel_selected]["Mounting system"][mounting_system_selected]["Location"]:
    print(key)
mounting_system_selected_location = str(input("Insert the production location for Mounting system: "))

#Assembly electricity
print("Electricity for assembly")
for key in data[panel_selected]["Electricity for assembly"]:    
    print(key)
electricity_mix_selected = str(input("Electricity mix: "))
print("Available locations")
for key in data[panel_selected]["Electricity for assembly"][electricity_mix_selected]["Location"]:
    print(key)
electricity_mix_selected_location = str(input("Insert the production location for Junction box: "))

#Junction box
print("Possible Junction boxes")
for key in data[panel_selected]["Junction box"]:    
    print(key)
junction_box_selected = str(input("Insert Junction box type: "))
print("Available locations")
for key in data[panel_selected]["Junction box"][junction_box_selected]["Location"]:
    print(key)
junction_box_selected_selected_location = str(input("Insert the production location for Junction box: "))

#Frame
print("Possible frames")
for key in data[panel_selected]["Frame"]:    
    print(key)
frame_selected = str(input("Insert Frame type: "))
print("Available locations")
for key in data[panel_selected]["Frame"][frame_selected]["Location"]:
    print(key)
frame_selected_location = str(input("Insert the production location for Frame: "))

categories(panel_selected, front_cover_selected, front_cover_selected_location, "Front cover")
categories(panel_selected, rear_surface_selected, rear_cover_selected_location, "Rear cover")
categories(panel_selected, encapsulant_selected, encapsulant_selected_location, "Encapsulant")
categories(panel_selected, "cell", cell_selected_location, "Cell")
categories(panel_selected, wires_selected, wires_selected_location, "Wires")
categories(panel_selected, frame_selected, frame_selected_location, "Frame")
categories(panel_selected, junction_box_selected, junction_box_selected_selected_location, "Junction box")
categories(panel_selected, electricity_mix_selected, electricity_mix_selected_location, "Electricity for assembly")
categories(panel_selected, mounting_system_selected, mounting_system_selected_location, "Mounting system")

climate_change_sum = sum(climate_change)
print(climate_change_sum)

climate_change_array = np.array(climate_change)
mylabels = ["front cover", "rear cover", "encapsulant", "cell", "wires", "frame", "junction box", "electricity for assembly", "mounting system"]

plt.style.use('seaborn-v0_8-pastel')

#seaborn-v0_8-pastel

plt.pie(climate_change_array, labels = mylabels, autopct = '%1.1f%%', textprops={'fontsize': 7})

plt.show() 

#Frame to add
#Electricity for assembly

#calculation 