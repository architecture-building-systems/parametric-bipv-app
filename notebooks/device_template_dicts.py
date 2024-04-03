def build_layer_option(layer_name, options_dict):
    layer_option = {"title": layer_name, "options": options_dict}
    return layer_option


cdte = [
    build_layer_option(layer_name, layer_options_dict)
    for layer_name, layer_options_dict in cdte_layers
]

cigs = [
    build_layer_option(layer_name, layer_options_dict)
    for layer_name, layer_options_dict in cigs_layers
]


cdte_layers = [
    "Frame",
    "Front cover",
    "TCO",
    "Cell",
    "Encapsulant",
    "Rear cover",
    "Wires",
    "Junction box",
    "Electricity for assembly",
]

cdte_compression = [
    "TCO",
    "Cell",
]

cigs_layers = [
    "Frame",
    "Front cover",
    "TCO",
    "Cell",
    "Encapsulant",
    "Conductive sheet",
    "Rear cover",
    "Wires",
    "Junction box",
    "Electricity for assembly",
]

cigs_compression = [
    "TCO",
    "Cell",
    "Conductive sheet",
]

mono_layers = [
    "Frame", #
    "Front cover", # 
    "Cell", #
    "Encapsulant", #
    "Rear cover", #
    "Wires", #
    "Junction box", #
    "Mounting system", #
    "Electricity for assembly", #
]

poly_layers = [
    "Frame",
    "Front cover",
    "Cell",
    "Encapsulant",
    "Rear cover",
    "Wires",
    "Junction box",
    "Mounting system",
    "Electricity for assembly",
]

organic_layers = [
    "Frame",
    "Front cover",
    "Active layer P3HT",
    "Active layer PCBM",
    "Back electrode",
    "Substrate",
    "Hole transport layer",
    "FTO",
    "Encapsulant",
    "Rear cover",
    "Wires",
    "Junction box",
    "Mounting system",
    "Electricity for assembly",
]

organic_compresion = [
    "P3HT",
    "PCBM",
    "Back electrode",
    "Substrate",
    "Hole transport layer",
    "FTO"
    ]

perovskite_layers = [
    "Frame",
    "Front cover",
    "Encapsulant",
    "Silicon cell",
    "Perovskite cell",
    "Conductive adhesive",
    "Rear cover",
    "Junction box",
    "Electricity for assembly",
    "bypass diode",
    "Mounting system"
]

perovskite_compression = [
    "Silicon cell",
    "Perovskite cell",
    "Conductive adhesive",
    
]