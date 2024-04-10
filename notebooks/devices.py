import math
import numpy as np

class System:
    def __init__(self, device_type, loss_factor = 0.1):
        if device_type=='monocrystalline':
            self.device = MonoDevice()
        elif device_type=='polycrystalline':
            self.device = PolyDevice()
        elif device_type=='cdte':
            self.device = CdTeDevice()
        elif device_type=='cigs':
            self.device = CIGSDevice()
        elif device_type=='organic':
            self.device = OrganicDevice()
        elif device_type=='perovskite':
            self.device = PerovskiteDevice()
        
        self.coverage = 10
        self.n_devices = math.ceil(self.coverage / self.device.module_area)
        self.system_loss_factor = loss_factor
        
    def system_output(self, G_eff, T_amb):
        """
        wraps the module_output function for the system and calculates
        loss and total output based on the number of modules in the array

        Args:
            G_eff (float): current irradiance (W/sqm.)
            T_amb (float): current temperature conditions (˚C)
            system_loss_factor (float): value between 0 and 1 to describe the loss in the system 
        """
        single_module_output_kwh = self.device.module_output(G_eff, T_amb)
        self.system_output_kwh = single_module_output_kwh * self.n_devices * (1 - self.system_loss_factor)
        self.system_lifetime_output_kwh = np.sum(projected_lifetime_output(self.system_output_kwh, self.device.lifetime))
        return self.system_output_kwh
    
    def system_mitigated_kwh(self, self_consumption):
        self.system_mitigated_lifetime_kwh = self.system_lifetime_output_kwh * self_consumption
        
    
    def system_cumulative_impact(self, impact_value, self_consumption):
        # calcualte the impact associated with the cosntructed system
        self.system_impact = impact_value * (self.n_devices * self.device.module_area)
        # using a self sufficiency ratio calculate how much of the lifetime output can be counted towards avoided electrcitiy consumption
        self.system_mitigated_kwh(self_consumption)
        # the avoided electricity consumption (mitigated lifetime kwh) is then used to cacluatle the impact per kWh (often kgCO2e / kWh)
        # this number can be more easily compared to grid factors
        if self.system_mitigated_lifetime_kwh==0:
            self.system_impact_generation = 0
        else:
            self.system_impact_generation = self.system_impact / self.system_mitigated_lifetime_kwh
        return self.system_impact_generation
    
    # def system_impact_curve()
    

class MonoDevice(object):
    def __init__(self):
        
        # taken from the CACTUS typical devices
        self.P_ref = 325 # peak power in test conditions (W)
        self.module_area = (1.706 * 1.034) # module size (sqm.)
        self.P_ref_norm = self.P_ref / self.module_area # peak power in test conditions divided module coverage (W/sqm.)
        self.T_ref = 25. # cell temperature in test conditions (˚C)
        self.G_ref = 1000. # irradiance in test conditions (W/sqm.)
        self.gamma = -0.381 # maximum power temperature coefficient (% / ˚C)
        self.NOCT = 45.1
        self.efficiency = 20.7 # expected conversion efficiency in %
        self.lifetime = 25 # expected lifetime of system
        self.default_impact = 329 
    
    def module_output(self, G_eff, T_amb):
        """
        built in access to the module_output calculator

        Args:
            G_eff (float): current irradiance (W/sqm.)
            T_amb (float): current temperature conditions (˚C)
            loss_factor (float): value between 0 and 1 to describe the loss
        """
        return module_output(G_eff, T_amb, self.NOCT, self.gamma, self.P_ref, self.T_ref, self.G_ref)

class PolyDevice(object):
    def __init__(self):
        
        # taken from the CACTUS typical devices
        self.P_ref = 335 # peak power in test conditions (W)
        self.module_area = (1.915 * 0.9785) # module size (sqm.)
        self.P_ref_norm = self.P_ref / self.module_area # peak power in test conditions divided module coverage (W/sqm.)
        self.T_ref = 25. # cell temperature in test conditions (˚C)
        self.G_ref = 1000. # irradiance in test conditions (W/sqm.)
        self.gamma = -0.409 # maximum power temperature coefficient (% / ˚C)
        self.NOCT = 45.2
        self.efficiency = 17.5 # expected conversion efficiency in %
        self.lifetime = 25 # expected lifetime of system
        self.default_impact = 264 #kgCO2e/m2
    
    def module_output(self, G_eff, T_amb):
        """
        built in access to the module_output calculator

        Args:
            G_eff (float): current irradiance (W/sqm.)
            T_amb (float): current temperature conditions (˚C)
            loss_factor (float): value between 0 and 1 to describe the loss
        """
        return module_output(G_eff, T_amb, self.NOCT, self.gamma, self.P_ref, self.T_ref, self.G_ref)

class CdTeDevice(object):
    def __init__(self):
        
        # taken from the CACTUS typical devices
        self.P_ref = 430 # peak power in test conditions (W)
        self.module_area = (1.9845 * 1.2338) # module size (sqm.)
        self.P_ref_norm = self.P_ref / self.module_area # peak power in test conditions divided module coverage (W/sqm.)
        self.T_ref = 25. # cell temperature in test conditions (˚C)
        self.G_ref = 1000. # irradiance in test conditions (W/sqm.)
        self.gamma = -0.307 # maximum power temperature coefficient (% / ˚C)
        self.NOCT = 50.7
        self.efficiency = 17.6 # expected conversion efficiency in %
        self.lifetime = 25 # expected lifetime of system
        self.default_impact = 151
    
    def module_output(self, G_eff, T_amb):
        """
        built in access to the module_output calculator

        Args:
            G_eff (float): current irradiance (W/sqm.)
            T_amb (float): current temperature conditions (˚C)
            loss_factor (float): value between 0 and 1 to describe the loss
        """
        return module_output(G_eff, T_amb, self.NOCT, self.gamma, self.P_ref, self.T_ref, self.G_ref)

class CIGSDevice(object):
    def __init__(self):
        
        # taken from the CACTUS typical devices
        self.P_ref = 165 # peak power in test conditions (W)
        self.module_area = (1.660 * 1.000) # module size (sqm.)
        self.P_ref_norm = self.P_ref / self.module_area # peak power in test conditions divided module coverage (W/sqm.)
        self.T_ref = 25. # cell temperature in test conditions (˚C)
        self.G_ref = 1000. # irradiance in test conditions (W/sqm.)
        self.gamma = -0.385 # maximum power temperature coefficient (% / ˚C)
        self.NOCT = 55.9
        self.efficiency = 9.9 # expected conversion efficiency in %
        self.lifetime = 25 # expected lifetime of system
        self.default_impact = 214
    
    def module_output(self, G_eff, T_amb):
        """
        built in access to the module_output calculator

        Args:
            G_eff (float): current irradiance (W/sqm.)
            T_amb (float): current temperature conditions (˚C)
            loss_factor (float): value between 0 and 1 to describe the loss
        """
        return module_output(G_eff, T_amb, self.NOCT, self.gamma, self.P_ref, self.T_ref, self.G_ref)

class PerovskiteDevice(object):
    # https://www.pv-magazine.com/2024/01/31/fraunhofer-ise-announces-25-efficient-perovskite-silicon-tandem-photovoltaic-module/
    # https://onlinelibrary.wiley.com/doi/full/10.1002/aenm.202000454
    def __init__(self):
        
        # taken from the CACTUS typical devices
        self.P_ref = 421 # peak power in test conditions (W)
        self.module_area = 1.68 # module size (sqm.)
        self.P_ref_norm = self.P_ref / self.module_area # peak power in test conditions divided module coverage (W/sqm.)
        self.T_ref = 25. # cell temperature in test conditions (˚C)
        self.G_ref = 1000. # irradiance in test conditions (W/sqm.)
        self.gamma = -0.170 # maximum power temperature coefficient (% / ˚C)
        self.NOCT = 43
        self.efficiency = 25.0 # expected conversion efficiency in %
        self.lifetime = 25 # expected lifetime of system
        self.default_impact = 347
    
    def module_output(self, G_eff, T_amb):
        """
        built in access to the module_output calculator

        Args:
            G_eff (float): current irradiance (W/sqm.)
            T_amb (float): current temperature conditions (˚C)
            loss_factor (float): value between 0 and 1 to describe the loss
        """
        return module_output(G_eff, T_amb, self.NOCT, self.gamma, self.P_ref, self.T_ref, self.G_ref)


class OrganicDevice(object):
    def __init__(self):
        
        # taken from the CACTUS typical devices
        self.P_ref = 55 # peak power in test conditions (W)
        self.module_area = (2.000 * 0.436) # module size (sqm.)
        self.P_ref_norm = self.P_ref / self.module_area # peak power in test conditions divided module coverage (W/sqm.)
        self.T_ref = 25. # cell temperature in test conditions (˚C)
        self.G_ref = 1000. # irradiance in test conditions (W/sqm.)
        self.gamma = -0.11 # maximum power temperature coefficient (% / ˚C)
        self.NOCT = 45 
        self.efficiency = 8.0 # expected conversion efficiency in %
        self.lifetime = 25 # expected lifetime of system
        self.default_impact = 97
    
    def module_output(self, G_eff, T_amb):
        """
        built in access to the module_output calculator

        Args:
            G_eff (float): current irradiance (W/sqm.)
            T_amb (float): current temperature conditions (˚C)
            loss_factor (float): value between 0 and 1 to describe the loss
        """
        return module_output(G_eff, T_amb, self.NOCT, self.gamma, self.P_ref, self.T_ref, self.G_ref)





def pv_watts_method(G_eff, T_cell, P_ref, gamma, T_ref=25, G_ref=1000):
    """
    :param G_eff: effective irradiance (W/sqm.)
    :param T_cell: current cell temperature (˚C)
    :param P_ref: peak power (W)
    :param gamma: maximum power temperature coefficient (% loss / ˚C) (typ -0.00485)
    :param T_ref: cell temperature at test conditions (˚C) Default to 25
    :param G_ref: irradiance at test conditions (W/m2) Default to 1000
    :return: power output from module
    """

    if gamma < -0.02:
        gamma = gamma / 100

    # if G_eff > 125:
    #     P_mp = (G_eff / G_ref) * P_ref * (1 + gamma * (T_cell - T_ref))
    # else:
    P_mp = ((0.008 * G_eff**2) / G_ref) * P_ref * (1 + gamma * (T_cell - T_ref))
    return P_mp


def ross_temperature_correction(G_effective, T_ambient, T_noct=45):
    """A simplified back of module temperature model

    Args:
        G_effective (float): effective radiation in W/sqm.
        T_ambient (float): ambient air temperature in degC
        T_noct (int, optional): Nominal Operating Cell Temeprature in degC. Defaults to 45.

    Returns:
        float: back of module temperature in degC that can be used in simple power conversion models
    """
    # factor of 0.1 converts irradiance from W/m2 to mW/cm2
    return round(T_ambient + (T_noct - 20.0) / 80.0 * (G_effective * 0.1), 3)


def module_output(G_eff, T_amb, NOCT, gamma, P_ref, T_ref, G_ref):
    device_temp = ross_temperature_correction(G_eff, T_amb, NOCT)
    return pv_watts_method(G_eff, device_temp, P_ref, gamma, T_ref, G_ref)


def projected_lifetime_output(
    production_values,
    lifetime,
    max_performance=100,
    annual_factor=0.54,
    min_performance=80,
):
    """
    Model the projected lifetime output of a PV module using a linear derating system

    Args:
        production_values (float): electrcity produced during the first year
        lifetime (int): the expected lifetime of the module
        max_performance (int, optional): _description_. Defaults to 100.
        annual_factor (float, optional): _description_. Defaults to 0.54.
        min_performance (int, optional): _description_. Defaults to 80.

    Returns:
        _type_: _description_
    """
    derate_factors = np.linspace(
        max_performance, max_performance - (lifetime * annual_factor), num=lifetime
    ).reshape(-1, 1)
    derate_factors = np.clip(derate_factors, min_performance, None) / 100
    lifetime_production = production_values * derate_factors
    return lifetime_production
