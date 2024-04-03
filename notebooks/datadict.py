import json


class DataFile(object):
    def __init__(self, filepath):
        self.filepath = filepath

        with open(self.filepath, "r") as f:
            self.data_dict = json.load(f)

        self.module_types = [i for i in list(self.data_dict.keys()) if i != "Inverter"]
        self.module_type_selected = "Monocrystalline"
        self.layer_selected = "Cell"
        self.layer_option_selected = "cell"
        self.location_selected = "RoW"
        self.impact_category_selected = "climate change"

        self.impact_metadata = [
            ["climate change", "kg CO2-Eq / sqm.", "climate change"],
            ["fossil", "kg oil-Eq / sqm.", "energy resources: non-renewable, fossil"],
            ["ozone depletion", "kg CFC-11-Eq / sqm.", "ozone depletion"],
            [
                "terrestrial acidification",
                "kg SO2-Eq / sqm.",
                "acidification: terrestrial",
            ],
            [
                "photochemical oxidant formation: human health",
                "kg NOx-Eq / sqm.",
                "photochemical oxidant formation: human health",
            ],
            [
                "photochemical oxidant formation: terrestrial ecosystems",
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
            ["marine eutrophication", "kg N-Eq / sqm.", "eutrophication: marine"],
            ["ionising radiation", "kg Co-60-Eq / sqm.", "ionising radiation"],
            [
                "human toxicity: non-carcinogenic",
                "",
                "human toxicity: non-carcinogenic",
            ],
            ["human toxicity: carcinogenic", "", "human toxicity: carcinogenic"],
            # [
            #     "metal depletion",
            #     "kg Fe-Eq / sqm.",
            #     "metal depletion"],
            # [
            #     "water depletion",
            #     "m3 / sqm.",
            #     "water depletion"],
            # [
            #     "agricultural land occupation",
            #     "m2*a crop-Eq / sqm.",
            #     "land use"],
            # [
            #     "urban land occupation",
            #     "m2a / sqm.",
            #     "land use"],
            # [
            #     "natural land transformation",
            #     "m2 / sqm.",
            #     "land use"],
            ["land use", "m2 / sqm.", "land use"],
        ]
        self.impact_categories = [n[0] for n in self.impact_metadata]
        self.impact_categories_long = [n[2] for n in self.impact_metadata]
        self.impact_categories_units = dict(
            zip(self.impact_categories, [n[1] for n in self.impact_metadata])
        )

    def get_layers(self):
        self.layers = [
            layer for layer in list(self.data_dict[self.module_type_selected].keys()) if layer != "Additional data"
        ]

    def get_layer_options(self):
        self.layer_options = list(
            self.data_dict[self.module_type_selected][self.layer_selected].keys()
        )

    def get_locations(self):
        self.locations = list(
            self.data_dict[self.module_type_selected][self.layer_selected][
                self.layer_option_selected
            ]["Location"].keys()
        )

    def layer_location_options(self):
        # iterate a print to show all layers and their options
        all_layers = []

        for layer in self.layers:
            layer_dict = {"title": layer, "options": {}}

            # print(f"\n{layer}:")
            self.layer_selected = layer
            self.get_layer_options()
            # print(f" - Layer Options")
            for layer_option in self.layer_options:
                self.layer_option_selected = layer_option
                self.get_locations()
                layer_dict["options"][layer_option] = self.locations
                # for location in self.locations:
                # print(f"    - {layer_option} ({location})")
            all_layers.append(layer_dict)
        return all_layers

    def impact_value(self):
        return data_dict_impact_value(
            self.data_dict,
            self.module_type_selected,
            self.layer_selected,
            self.layer_option_selected,
            self.location_selected,
            self.impact_category_selected,
        )

    def assembly_impact(self, module_type, impact_category, layer_options_dict):
        self.module_type_selected = module_type
        self.impact_category_selected = impact_category

        results_dict = {}

        for layer in self.layers:
            # print("     ", layer)
            self.layer_selected = layer
            self.layer_option_selected = layer_options_dict[layer]["option"]
            self.location_selected = layer_options_dict[layer]["location"]
            # print("     ",
            #     self.data_dict[module_type][layer][self.layer_option_selected][
            #         "Location"
            #     ][self.location_selected].keys()
            # )
            results_dict[layer] = self.impact_value()

        return results_dict

    def holistic_lca(self, module_type, layer_options_dict):

        holistic_data = {}
        skip_categories = ["metal depletion", "water depletion"]
        for n, impact_category in enumerate(self.impact_categories_long):
            if impact_category in holistic_data.keys():
                impact_category_key = f"{impact_category}_{n}"
            else:
                impact_category_key = impact_category
            # if impact_category in skip_categories:
            #     continue
            # print(impact_category)

            holistic_data[impact_category_key] = self.assembly_impact(
                module_type, impact_category, layer_options_dict
            )
            holistic_data[impact_category_key].update(
                {
                    "non_numeric_unit": self.impact_categories_units[
                        self.impact_categories[n]
                    ]
                }
            )
            holistic_data[impact_category_key].update(
                {"non_numeric_short_name": self.impact_categories[n]}
            )

            holistic_data[impact_category_key].update(
                {"Inverter": self.inverter_impact("0.5 kW", "RER", impact_category)}
            )
        return holistic_data

    def inverter_impact(self, inverter_size, location_code, impact_category):
        return self.data_dict["Inverter"][inverter_size]["String inverter"]["Location"][
            location_code
        ][impact_category]


def data_dict_impact_value(
    data_dict, module_type, layer, layer_option, location, impact_category
):
    try:
        impact = round(
            data_dict[module_type][layer][layer_option]["Location"][location][
                impact_category
            ],
            5,
        )
    except KeyError:
        print(
            "Key missing: ",
            [module_type, layer, layer_option, location, impact_category],
        )
        print("Returning 0 value")
        impact = 0

    return impact
