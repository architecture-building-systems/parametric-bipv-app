import pandas as pd
import os
import datadict
import json
import pathlib


def clean_layer(input_layer):
    return input_layer.lower().replace(" ", "_")


class Naming:
    def __init__(self):

        self.raw_devices = [
            "Organic PV",
            "Silicon tandem",
            "Monocrystalline",
            "Polycrystalline",
            "CdTe",
            "CIGS",
        ]

        self.convert_devices = {
            "Organic PV": "organic",
            "Silicon tandem": "perovskite",
            "Monocrystalline": "monocrystalline",
            "Polycrystalline": "polycrystalline",
            "CdTe": "cdte",
            "CIGS": "cigs",
        }

        self.raw_layers = [
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

        self.convert_layers = [
            "frame",
            "front_cover",
            "cell",
            "encapsulant",
            "rear_cover",
            "wires",
            "junction_box",
            "mounting_system",
            "electricity_for_assembly",
        ]

        self.raw_indicators = [
            "Quantity per m2",
            "energy resources: non-renewable, fossil",
            "acidification: terrestrial",
            "climate change",
            "ecotoxicity: freshwater",
            "eutrophication: freshwater",
            "eutrophication: marine",
            "human toxicity: carcinogenic",
            "human toxicity: non-carcinogenic",
            "ionising radiation",
            "land use",
            "ozone depletion",
            "particulate matter formation",
            "photochemical oxidant formation: human health",
            "photochemical oxidant formation: terrestrial ecosystems",
        ]
        
        self.impact_metadata = [
            [
                "climate change", 
                "kg CO2-Eq / sqm.", 
                "climate change"
            ],
            [
                "fossil resource use", 
                "MJ / sqm.", 
                "energy resources: non-renewable, fossil"
            ],
            [
                "ozone depletion", 
                "kg CFC-11-Eq / sqm.", 
                "ozone depletion"],
            [
                "terrestrial acidification",
                "kg SO2-Eq / sqm.",
                "acidification: terrestrial",
            ],
            [
                "human health photochemical",
                "kg NOx-Eq / sqm.",
                "photochemical oxidant formation: human health",
            ],
            [
                "terrestrial photochemical oxidant",
                "kg NOx-Eq / sqm.",
                "photochemical oxidant formation: terrestrial ecosystems",
            ],
            [
                "freshwater ecotoxicity",
                "kg 1,4-DCB-Eq / sqm.",
                "ecotoxicity: freshwater",
            ],
            [
                "particulate matter formation",
                "kg PM2.5-Eq / sqm.",
                "particulate matter formation",
            ],
            [
                "freshwater eutrophication",
                "kg P-Eq / sqm.",
                "eutrophication: freshwater",
            ],
            [
                "marine eutrophication", 
                "kg N-Eq / sqm.", 
                "eutrophication: marine"
            ],
            [
                "ionising radiation", 
                "kg Co-60-Eq / sqm.", 
                "ionising radiation"
            ],
            [
                "non-carcinogenic",
                "(HTPnc) kg 1,4-DCB-Eq",
                "human toxicity: non-carcinogenic",
            ],
            [
                "human toxicity: carcinogenic", 
                "(HTPc) kg 1,4-DCB-Eq", 
                "human toxicity: carcinogenic"
            ],
            [
                "land use", 
                "sqm. land / sqm.", 
                "land use"
            ],
        ]
        self.impact_categories = [n[0] for n in self.impact_metadata]
        self.impact_categories_long = [n[2] for n in self.impact_metadata]
        self.impact_categories_units = dict(
            zip(self.impact_categories_long, [n[1] for n in self.impact_metadata])
        )
        self.impact_categories_short = dict(zip(self.impact_categories_long, self.impact_categories))




def gather_basic_layer_data(data_dict, layer, layer_options, indicators):
    # build empty dict to fill
    layer_dict = {}
    for layer_option in layer_options:
        # clean the key
        layer_option_clean = clean_layer(layer_option)
        # set the empty dict
        layer_dict[layer_option_clean] = {}
        # get the locations
        layer_option_locations = list(data_dict[layer][layer_option]["Location"].keys())
        layer_option_locations = [
            location
            for location in layer_option_locations
            if len(data_dict[layer][layer_option]["Location"][location].keys()) > 4
        ]
        for location in layer_option_locations:
            # gather the result data fromt he raw input
            location_results = dict(
                [
                    (
                        indicator,
                        data_dict[layer][layer_option]["Location"][location][indicator],
                    )
                    for indicator in indicators
                ]
            )
            # set it into the dict
            layer_dict[layer_option_clean][location] = location_results
    return layer_dict


def gather_basic_layer_data_electricity(
    data_dict, layer, layer_option, layer_option_locations, indicators
):

    # build empty dict to fill
    layer_dict = {}
    # clean the key
    layer_option_clean = clean_layer(layer_option)
    # set the empty dict
    layer_dict[layer_option_clean] = {}
    for location in layer_option_locations:
        # gather the result data fromt he raw input
        location_results = dict(
            [
                (
                    indicator,
                    data_dict[layer][layer_option]["Location"][location][indicator],
                )
                for indicator in indicators
            ]
        )
        # set it into the dict
        layer_dict[layer_option_clean][location] = location_results
    return layer_dict


def gen_null_results(indicators):
    return dict([(indicator, 0) for indicator in indicators])


def merge_mounting_system(layer_dict, indicators):
    layer_global = dict(
        [
            (
                indicator,
                layer_dict["Aluminium wrought alloy"]["Location"]["GLO"][indicator]
                + layer_dict["Aluminium processing"]["Location"]["GLO"][indicator],
            )
            for indicator in indicators
        ]
    )
    layer_europe = dict(
        [
            (
                indicator,
                layer_dict["Aluminium wrought alloy"]["Location"]["GLO"][indicator]
                + layer_dict["Aluminium processing"]["Location"]["RER"][indicator],
            )
            for indicator in indicators
        ]
    )
    mounting_system = {"GLO": layer_global, "RER": layer_europe}
    return mounting_system


def make_tempered_glass(layer_dict, indicators):
    layer_row = dict(
        [
            (
                indicator,
                layer_dict["Glass"]["Location"]["RoW"][indicator]
                + layer_dict["Tempering"]["Location"]["RoW"][indicator],
            )
            for indicator in indicators
        ]
    )
    layer_europe = dict(
        [
            (
                indicator,
                layer_dict["Glass"]["Location"]["RER"][indicator]
                + layer_dict["Tempering"]["Location"]["RER"][indicator],
            )
            for indicator in indicators
        ]
    )
    tempered_glass = {"RoW": layer_row, "RER": layer_europe}
    return tempered_glass


def build_monocrystalline(data_dict, raw_layers, indicators, raw_mono_data_dict):
    final_device_dict = {}
    for layer in raw_layers:
        # clean layer
        layer_clean = clean_layer(layer)

        # set an empty dict level for the results
        final_device_dict[layer_clean] = {}

        if layer == "Wires":
            pass
        elif layer == "Mounting system":
            pass
        else:
            layer_options = list(data_dict[layer].keys())

        # add frame data
        if layer == "Frame":
            # get layer options

            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )
            # add a no frame result
            final_device_dict[layer_clean]["no_frame"] = {
                "none": gen_null_results(indicators)
            }

        elif layer == "Encapsulant":
            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )

        elif layer == "Wires":
            layer_options = list(raw_mono_data_dict[layer].keys())
            final_device_dict[layer_clean] = gather_basic_layer_data(
                raw_mono_data_dict, layer, layer_options, indicators
            )

        elif layer == "Junction box":
            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )

        elif layer == "Cell":
            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )

        elif layer == "Electricity for assembly":
            layer_option = "Electricity medium voltage"
            locations = list(data_dict[layer][layer_option]["Location"].keys())
            # filter locations based on if available indicator data is there
            final_locations = [
                l
                for l in locations
                if len(list(data_dict[layer][layer_option]["Location"][l].keys())) == 18
            ]
            final_device_dict[layer_clean] = gather_basic_layer_data_electricity(
                data_dict, layer, layer_option, final_locations, indicators
            )

        elif layer == "Mounting system":
            aluminium_layer_dict = raw_mono_data_dict[layer]
            # combine aluminium layer options
            final_device_dict[layer_clean]["aluminium_mounting"] = (
                merge_mounting_system(aluminium_layer_dict, indicators)
            )  # something witht he moutning system combination
            # no mounting system
            final_device_dict[layer_clean]["no_mounting"] = {
                "none": gen_null_results(indicators)
            }

        elif layer == "Front cover":
            front_layer_dict = data_dict[layer]
            # get layer options
            layer_options = [
                l for l in list(data_dict[layer].keys()) if l != "Tempering"
            ]
            # layer_options = [l for l in layer_options if l!="Tempering"]
            # make tempered glass
            final_device_dict[layer_clean]["tempered_glass"] = make_tempered_glass(
                front_layer_dict, indicators
            )
            # add remainder
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, layer, layer_options, indicators)
            )

        elif layer == "Rear cover":
            front_layer_dict = data_dict["Front cover"]
            rear_layer_dict = data_dict[layer]

            # make tempered glass
            final_device_dict[layer_clean]["tempered_glass"] = make_tempered_glass(
                front_layer_dict, indicators
            )
            # add remainder
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, layer, layer_options, indicators)
            )
            # add glass
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, "Front cover", ["Glass"], indicators)
            )

        else:
            print(f"Layer {layer} does not exist.")
    return final_device_dict


def build_polycrystalline(data_dict, raw_layers, indicators, raw_mono_data_dict):
    return build_monocrystalline(data_dict, raw_layers, indicators, raw_mono_data_dict)


def cigs_cell_compile(data_dict, indicators):
    cell_dict = data_dict["Cell"]
    tco_dict = data_dict["TCO"]

    # the sum TCO sublayers for indium and zinc from the two locations
    tco_rer = dict(
        [
            (
                indicator,
                tco_dict["Indium tin oxide"]["Location"]["RER"][indicator]
                + tco_dict["Zinc oxide"]["Location"]["RER"][indicator],
            )
            for indicator in indicators
        ]
    )
    tco_row = dict(
        [
            (
                indicator,
                tco_dict["Indium tin oxide"]["Location"]["RoW"][indicator]
                + tco_dict["Zinc oxide"]["Location"]["RoW"][indicator],
            )
            for indicator in indicators
        ]
    )
    # take mean of the locations
    tco_mean = dict(
        [
            (indicator, (tco_rer[indicator] + tco_row[indicator]) / 2)
            for indicator in indicators
        ]
    )

    # cadmium sulfide
    cadmium_mean = dict(
        [
            (
                indicator,
                (
                    cell_dict["Cadmium sulfide"]["Location"]["RoW"][indicator]
                    + cell_dict["Cadmium sulfide"]["Location"]["US"][indicator]
                )
                / 2,
            )
            for indicator in indicators
        ]
    )
    ## GLO
    c_glo = dict(
        [
            (indicator, cadmium_mean[indicator] + tco_mean[indicator])
            for indicator in indicators
        ]
    )

    # indium
    ## RER
    i_rer = dict(
        [
            (
                indicator,
                cell_dict["Indium"]["Location"]["RER"][indicator] + tco_mean[indicator],
            )
            for indicator in indicators
        ]
    )
    ## RoW
    i_row = dict(
        [
            (
                indicator,
                cell_dict["Indium"]["Location"]["RoW"][indicator] + tco_mean[indicator],
            )
            for indicator in indicators
        ]
    )
    ## GLO
    i_glo = dict(
        [
            (
                indicator,
                cell_dict["Indium"]["Location"]["GLO"][indicator] + tco_mean[indicator],
            )
            for indicator in indicators
        ]
    )

    # gallium
    g_glo = dict(
        [
            (
                indicator,
                cell_dict["Gallium"]["Location"]["GLO"][indicator]
                + tco_mean[indicator],
            )
            for indicator in indicators
        ]
    )

    # selenium
    ## RER
    s_rer = dict(
        [
            (
                indicator,
                cell_dict["Selenium"]["Location"]["RER"][indicator]
                + tco_mean[indicator],
            )
            for indicator in indicators
        ]
    )
    ## RoW
    s_row = dict(
        [
            (
                indicator,
                cell_dict["Selenium"]["Location"]["RoW"][indicator]
                + tco_mean[indicator],
            )
            for indicator in indicators
        ]
    )
    ## GLO
    s_glo = dict(
        [
            (
                indicator,
                cell_dict["Selenium"]["Location"]["GLO"][indicator]
                + tco_mean[indicator],
            )
            for indicator in indicators
        ]
    )

    # compile_cigs_locations
    ## RER
    cigs_rer = dict(
        [
            (
                indicator,
                c_glo[indicator]
                + i_rer[indicator]
                + g_glo[indicator]
                + s_rer[indicator],
            )
            for indicator in indicators
        ]
    )

    ## RoW
    cigs_row = dict(
        [
            (
                indicator,
                c_glo[indicator]
                + i_row[indicator]
                + g_glo[indicator]
                + s_row[indicator],
            )
            for indicator in indicators
        ]
    )

    ## GLO
    cigs_glo = dict(
        [
            (
                indicator,
                c_glo[indicator]
                + i_glo[indicator]
                + g_glo[indicator]
                + s_glo[indicator],
            )
            for indicator in indicators
        ]
    )

    cigs_locations = {"RER": cigs_rer, "RoW": cigs_row, "GLO": cigs_glo}
    return cigs_locations


def build_cigs(data_dict, raw_layers, indicators, raw_mono_data_dict):
    final_device_dict = {}
    for layer in raw_layers:
        # clean layer
        layer_clean = clean_layer(layer)

        # set an empty dict level for the results
        final_device_dict[layer_clean] = {}
        if layer == "Mounting system":
            pass
        else:
            layer_options = list(data_dict[layer].keys())

        # add frame data
        if layer == "Frame":
            # get layer options

            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )
            # add a no frame result
            final_device_dict[layer_clean]["no_frame"] = {
                "none": gen_null_results(indicators)
            }

        elif layer == "Encapsulant":
            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )

        elif layer == "Wires":
            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )

        elif layer == "Junction box":
            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )

        elif layer == "Cell":
            # final_device_dict[layer_clean] = gather_basic_layer_data(data_dict, layer, layer_options, indicators)
            final_device_dict[layer_clean] = {
                "cell": cigs_cell_compile(data_dict, indicators)
            }

        elif layer == "Electricity for assembly":
            layer_option = "Electricity medium voltage"
            locations = list(data_dict[layer][layer_option]["Location"].keys())
            # filter locations based on if available indicator data is there
            final_locations = [
                l
                for l in locations
                if len(list(data_dict[layer][layer_option]["Location"][l].keys())) == 18
            ]
            final_device_dict[layer_clean] = gather_basic_layer_data_electricity(
                data_dict, layer, layer_option, final_locations, indicators
            )

        elif layer == "Mounting system":
            aluminium_layer_dict = raw_mono_data_dict[layer]
            # combine aluminium layer options
            final_device_dict[layer_clean]["aluminium_mounting"] = (
                merge_mounting_system(aluminium_layer_dict, indicators)
            )  # something witht he moutning system combination
            # no mounting system
            final_device_dict[layer_clean]["no_mounting"] = {
                "none": gen_null_results(indicators)
            }

        elif layer == "Front cover":
            front_layer_dict = data_dict[layer]
            # get layer options
            layer_options = [
                l for l in list(data_dict[layer].keys()) if l != "Tempering"
            ]
            # layer_options = [l for l in layer_options if l!="Tempering"]
            # make tempered glass
            final_device_dict[layer_clean]["tempered_glass"] = make_tempered_glass(
                front_layer_dict, indicators
            )
            # add remainder
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, layer, layer_options, indicators)
            )

        elif layer == "Rear cover":
            front_layer_dict = data_dict["Front cover"]
            rear_layer_dict = data_dict[layer]

            # make tempered glass
            final_device_dict[layer_clean]["tempered_glass"] = make_tempered_glass(
                front_layer_dict, indicators
            )
            # add remainder
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, layer, layer_options, indicators)
            )
            # add glass
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, "Front cover", ["Glass"], indicators)
            )

        else:
            print(f"Layer {layer} does not exist.")
    return final_device_dict


def cdte_cell_compile(data_dict, indicators):
    cell_dict = data_dict["Cell"]
    tco_dict = data_dict["TCO"]

    # mean of the two locations for TCO
    tco_mean = dict(
        [
            (
                indicator,
                (
                    tco_dict["Indium tin oxide"]["Location"]["RoW"][indicator]
                    + tco_dict["Indium tin oxide"]["Location"]["RER"][indicator]
                )
                / 2,
            )
            for indicator in indicators
        ]
    )

    # calculate the cell from CdTe and CdS for the US and add the mean TCO values for each indicators
    cell_US = dict(
        [
            (
                indicator,
                cell_dict["Cadmium telluride"]["Location"]["US"][indicator]
                + cell_dict["Cadmium sulfide"]["Location"]["US"][indicator]
                + tco_mean[indicator],
            )
            for indicator in indicators
        ]
    )

    # calculate the cell from CdTe and CdS for the RoW and add the mean TCO values for each indicators
    cell_RoW = dict(
        [
            (
                indicator,
                cell_dict["Cadmium telluride"]["Location"]["RoW"][indicator]
                + cell_dict["Cadmium sulfide"]["Location"]["RoW"][indicator]
                + tco_mean[indicator],
            )
            for indicator in indicators
        ]
    )

    # rebuild the dict
    cdte_locations = {"US": cell_US, "RoW": cell_RoW}
    return cdte_locations


def build_cdte(data_dict, raw_layers, indicators, raw_mono_data_dict):
    final_device_dict = {}
    for layer in raw_layers:
        # clean layer
        layer_clean = clean_layer(layer)
        # set an empty dict level for the results
        final_device_dict[layer_clean] = {}

        if layer == "Mounting system":
            pass
        elif layer == "Wires":
            pass
        else:
            layer_options = list(data_dict[layer].keys())

        # add frame data
        if layer == "Frame":
            # get layer options

            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )
            # add a no frame result
            final_device_dict[layer_clean]["no_frame"] = {
                "none": gen_null_results(indicators)
            }

        elif layer == "Encapsulant":
            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )

        elif layer == "Wires":
            layer_options = list(raw_mono_data_dict[layer].keys())
            final_device_dict[layer_clean] = gather_basic_layer_data(
                raw_mono_data_dict, layer, layer_options, indicators
            )

        elif layer == "Junction box":
            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )

        elif layer == "Cell":
            # final_device_dict[layer_clean] = gather_basic_layer_data(data_dict, layer, layer_options, indicators)
            final_device_dict[layer_clean] = {
                "cell": cdte_cell_compile(data_dict, indicators)
            }

        elif layer == "Electricity for assembly":
            layer_option = "Electricity medium voltage"
            locations = list(data_dict[layer][layer_option]["Location"].keys())
            # filter locations based on if available indicator data is there
            final_locations = [
                l
                for l in locations
                if len(list(data_dict[layer][layer_option]["Location"][l].keys())) == 18
            ]
            final_device_dict[layer_clean] = gather_basic_layer_data_electricity(
                data_dict, layer, layer_option, final_locations, indicators
            )

        elif layer == "Mounting system":
            aluminium_layer_dict = raw_mono_data_dict[layer]
            # combine aluminium layer options
            final_device_dict[layer_clean]["aluminium_mounting"] = (
                merge_mounting_system(aluminium_layer_dict, indicators)
            )  # something witht he moutning system combination
            # no mounting system
            final_device_dict[layer_clean]["no_mounting"] = {
                "none": gen_null_results(indicators)
            }

        elif layer == "Front cover":
            front_layer_dict = data_dict[layer]
            # get layer options
            layer_options = [
                l for l in list(data_dict[layer].keys()) if l != "Tempering"
            ]
            # layer_options = [l for l in layer_options if l!="Tempering"]
            # make tempered glass
            final_device_dict[layer_clean]["tempered_glass"] = make_tempered_glass(
                front_layer_dict, indicators
            )
            # add remainder
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, layer, layer_options, indicators)
            )

        elif layer == "Rear cover":
            front_layer_dict = data_dict["Front cover"]
            rear_layer_dict = data_dict[layer]

            # make tempered glass
            final_device_dict[layer_clean]["tempered_glass"] = make_tempered_glass(
                front_layer_dict, indicators
            )
            # add remainder
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, layer, layer_options, indicators)
            )
            # add glass
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, "Front cover", ["Glass"], indicators)
            )

        else:
            print(f"Layer {layer} does not exist.")
    return final_device_dict


def organic_cell_compile(data_dict, indicators):
    cell_layers = [
        "Back electrode",
        "Electron transport layer",
        "Substrate",
        "FTO",
        "Hole transport layer",
        "P3HT",
        "PCBM",
    ]

    cell_layers_results = []
    for cell_layer in cell_layers:
        cell_dict = data_dict[cell_layer]
        cell_sublayers = list(cell_dict.keys())

        cell_sublayer_means = []
        for cell_sublayer in cell_sublayers:
            cell_sublayer_locations = list(cell_dict[cell_sublayer]["Location"].keys())
            cell_sublayer_locations = [
                location
                for location in cell_sublayer_locations
                if len(cell_dict[cell_sublayer]["Location"][location].keys()) > 4
            ]

            sublayer_location_mean = {}
            for indicator in indicators:
                sublayer_location_mean[indicator] = sum(
                    [
                        cell_dict[cell_sublayer]["Location"][location][indicator]
                        for location in cell_sublayer_locations
                    ]
                ) / len(cell_sublayer_locations)
            cell_sublayer_means.append(pd.Series(sublayer_location_mean))
        cell_layers_results.append(
            pd.concat(cell_sublayer_means, axis=1).sum(axis=1).rename(cell_sublayer)
        )

    cell_result = {
        "generic": pd.concat(cell_layers_results, axis=1).sum(axis=1).to_dict()
    }
    return cell_result


def build_organic(data_dict, raw_layers, indicators, raw_mono_data_dict):
    final_device_dict = {}
    for layer in raw_layers:
        # clean layer
        layer_clean = clean_layer(layer)
        # set an empty dict level for the results
        final_device_dict[layer_clean] = {}

        if layer == "Frame":
            pass
        elif layer == "Cell":
            pass
        else:
            layer_options = list(data_dict[layer].keys())

        # add frame data
        if layer == "Frame":
            # get layer options
            layer_options = list(raw_mono_data_dict[layer].keys())
            final_device_dict[layer_clean] = gather_basic_layer_data(
                raw_mono_data_dict, layer, layer_options, indicators
            )
            # add a no frame result
            final_device_dict[layer_clean]["no_frame"] = {
                "none": gen_null_results(indicators)
            }

        elif layer == "Encapsulant":
            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )

        elif layer == "Wires":
            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )

        elif layer == "Junction box":
            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )

        elif layer == "Cell":
            # final_device_dict[layer_clean] = gather_basic_layer_data(data_dict, layer, layer_options, indicators)
            final_device_dict[layer_clean] = {
                "cell": organic_cell_compile(data_dict, indicators)
            }

        elif layer == "Electricity for assembly":
            layer_option = "Electricity medium voltage"
            locations = list(data_dict[layer][layer_option]["Location"].keys())
            # filter locations based on if available indicator data is there
            final_locations = [
                l
                for l in locations
                if len(list(data_dict[layer][layer_option]["Location"][l].keys())) == 18
            ]
            final_device_dict[layer_clean] = gather_basic_layer_data_electricity(
                data_dict, layer, layer_option, final_locations, indicators
            )

        elif layer == "Mounting system":
            aluminium_layer_dict = data_dict[layer]
            # combine aluminium layer options
            final_device_dict[layer_clean]["aluminium_mounting"] = (
                merge_mounting_system(aluminium_layer_dict, indicators)
            )  # something witht he moutning system combination
            # no mounting system
            final_device_dict[layer_clean]["no_mounting"] = {
                "none": gen_null_results(indicators)
            }

        elif layer == "Front cover":
            front_layer_dict = data_dict[layer]
            # get layer options
            layer_options = [
                l for l in list(data_dict[layer].keys()) if l != "Tempering"
            ]
            # layer_options = [l for l in layer_options if l!="Tempering"]
            # make tempered glass
            final_device_dict[layer_clean]["tempered_glass"] = make_tempered_glass(
                front_layer_dict, indicators
            )
            # add remainder
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, layer, layer_options, indicators)
            )

        elif layer == "Rear cover":
            front_layer_dict = data_dict["Front cover"]
            rear_layer_dict = data_dict[layer]

            # make tempered glass
            final_device_dict[layer_clean]["tempered_glass"] = make_tempered_glass(
                front_layer_dict, indicators
            )
            # add remainder
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, layer, layer_options, indicators)
            )
            # add glass
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, "Front cover", ["Glass"], indicators)
            )

        else:
            print(f"Layer {layer} does not exist.")
    return final_device_dict


def perovskite_cell_compile(data_dict, indicators):
    cell_result = {}
    for specific_location in ["RER", "RoW"]:
        cell_result[specific_location] = {}
        for indicator in indicators:
            # get TCO
            a = data_dict["TCO"]["Indium tin oxide"]["Location"][specific_location][
                indicator
            ]
            # get elements for cell
            b = data_dict["Silicon cell"]["cell"]["Location"][specific_location][
                indicator
            ]
            c = data_dict["Perovskite cell"]["Lead iodide"]["Location"]["GLO"][
                indicator
            ]
            d = data_dict["Perovskite cell"]["Methyl iodide"]["Location"][
                specific_location
            ][indicator]
            e = data_dict["Perovskite cell"]["Ethylene bromide"]["Location"][
                specific_location
            ][indicator]
            f = data_dict["Perovskite cell"]["Chemicals organic"]["Location"]["GLO"][
                indicator
            ]
            g = data_dict["Perovskite cell"]["Solvents, organic"]["Location"]["GLO"][
                indicator
            ]
            # get adhesive
            h = data_dict["Conductive adhesive"]["Silver"]["Location"]["GLO"][indicator]
            cell_result[specific_location][indicator] = sum([a, b, c, d, e, f, g, h])
    return cell_result


def build_perovskite(data_dict, raw_layers, indicators, raw_mono_data_dict):
    final_device_dict = {}
    for layer in raw_layers:
        # clean layer
        layer_clean = clean_layer(layer)

        # set an empty dict level for the results
        final_device_dict[layer_clean] = {}

        if layer == "Wires":
            pass
        elif layer == "Mounting system":
            pass
        elif layer == "Cell":
            pass
        else:
            layer_options = list(data_dict[layer].keys())

        # add frame data
        if layer == "Frame":
            # get layer options

            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )
            # add a no frame result
            final_device_dict[layer_clean]["no_frame"] = {
                "none": gen_null_results(indicators)
            }

        elif layer == "Encapsulant":
            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )

        elif layer == "Wires":
            layer_options = list(raw_mono_data_dict[layer].keys())
            final_device_dict[layer_clean] = gather_basic_layer_data(
                raw_mono_data_dict, layer, layer_options, indicators
            )

        elif layer == "Junction box":
            final_device_dict[layer_clean] = gather_basic_layer_data(
                data_dict, layer, layer_options, indicators
            )

        elif layer == "Cell":
            # final_device_dict[layer_clean] = gather_basic_layer_data(data_dict, layer, layer_options, indicators)
            final_device_dict[layer_clean] = {
                "cell": perovskite_cell_compile(data_dict, indicators)
            }

        elif layer == "Electricity for assembly":
            layer_option = "Electricity medium voltage"
            locations = list(data_dict[layer][layer_option]["Location"].keys())
            # filter locations based on if available indicator data is there
            final_locations = [
                l
                for l in locations
                if len(list(data_dict[layer][layer_option]["Location"][l].keys())) == 18
            ]
            final_device_dict[layer_clean] = gather_basic_layer_data_electricity(
                data_dict, layer, layer_option, final_locations, indicators
            )

        elif layer == "Mounting system":
            aluminium_layer_dict = raw_mono_data_dict[layer]
            # combine aluminium layer options
            final_device_dict[layer_clean]["aluminium_mounting"] = (
                merge_mounting_system(aluminium_layer_dict, indicators)
            )  # something witht he moutning system combination
            # no mounting system
            final_device_dict[layer_clean]["no_mounting"] = {
                "none": gen_null_results(indicators)
            }

        elif layer == "Front cover":
            front_layer_dict = data_dict[layer]
            # get layer options
            layer_options = [
                l for l in list(data_dict[layer].keys()) if l != "Tempering"
            ]
            # layer_options = [l for l in layer_options if l!="Tempering"]
            # make tempered glass
            final_device_dict[layer_clean]["tempered_glass"] = make_tempered_glass(
                front_layer_dict, indicators
            )
            # add remainder
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, layer, layer_options, indicators)
            )

        elif layer == "Rear cover":
            front_layer_dict = data_dict["Front cover"]
            rear_layer_dict = data_dict[layer]

            # make tempered glass
            final_device_dict[layer_clean]["tempered_glass"] = make_tempered_glass(
                front_layer_dict, indicators
            )
            # add remainder
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, layer, layer_options, indicators)
            )
            # add glass
            final_device_dict[layer_clean].update(
                gather_basic_layer_data(data_dict, "Front cover", ["Glass"], indicators)
            )

        else:
            print(f"Layer {layer} does not exist.")
    return final_device_dict


def intake_switcher(device, data_dict, raw_layers, raw_indicators):
    if device == "Monocrystalline":
        result = build_monocrystalline(
            data_dict["Monocrystalline"],
            raw_layers,
            raw_indicators,
            data_dict["Monocrystalline"],
        )
    elif device == "Polycrystalline":
        result = build_polycrystalline(
            data_dict[device], raw_layers, raw_indicators, data_dict["Monocrystalline"]
        )
    elif device == "CdTe":
        result = build_cdte(
            data_dict[device], raw_layers, raw_indicators, data_dict["Monocrystalline"]
        )
    elif device == "CIGS":
        result = build_cigs(
            data_dict[device], raw_layers, raw_indicators, data_dict["Monocrystalline"]
        )
    elif device == "Organic PV":
        result = build_organic(
            data_dict[device], raw_layers, raw_indicators, data_dict["Monocrystalline"]
        )
    elif device == "Silicon tandem":
        result = build_perovskite(
            data_dict[device], raw_layers, raw_indicators, data_dict["Monocrystalline"]
        )
    else:
        result = None
        print(
            "Device must be from ['Monocrystalline', 'Polycrystalline', 'CdTe', 'CIGS', 'Organic PV', 'Silicon tandem']."
        )
    return result


def transform_raw_data(data, names):
    device_dict = {}
    base_dict = {}

    for device in names.raw_device_list:
        clean_device = names.convert_devices[device]

        converted_data = intake_switcher(
            device, data.data_dict, names.raw_layer_list, names.raw_indicator_list
        )
        device_dict[clean_device] = converted_data

        base_dict[clean_device] = []

        for k, v in converted_data.items():
            new_entry = {"title": k, "options": {}}
            layer_option_locations = {}
            for k_sub, v_sub in v.items():

                locations = list(v_sub)
                layer_option_locations[k_sub] = locations
            new_entry["options"] = layer_option_locations
            base_dict[clean_device].append(new_entry)

    return device_dict, base_dict


def write_dict_to_json_file(data, file_name):
    """
    Converts a Python dictionary to a JSON-formatted string and writes it to a file.

    :param data: Python dictionary to be converted.
    :param file_name: Name of the file to which the JSON data will be written.
    """
    # Convert the dictionary to a JSON-formatted string
    json_data = json.dumps(data, indent=4)

    # Write the JSON data to a file
    with open(file_name, "w") as file:
        file.write(json_data)


def main():

    static_dir = os.path.join(pathlib.Path(os.getcwd()).parent, "static")
    data_dir = os.path.join(static_dir, "data")
    device_dict, base_dict = transform_raw_data(
        datadict.DataFile(os.path.join(static_dir, "raw_lca_data.json")),
        Naming(),
    )
    write_dict_to_json_file(
        device_dict, os.path.join(data_dir, "device_impact_data.json")
    )
    write_dict_to_json_file(base_dict, os.path.join(data_dir, "device_layer_data.json"))
