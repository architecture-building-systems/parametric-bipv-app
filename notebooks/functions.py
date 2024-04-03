import numpy as np


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

    if G_eff > 125:
        P_mp = (G_eff / G_ref) * P_ref * (1 + gamma * (T_cell - T_ref))
    else:
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
