import calendar
import pandas as pd


def read_epw(path_data, create_timeseries=True):
    tmy_labels = [
        'year', 'month', 'day', 'hour', 'minute', 'datasource', 'drybulb_C',
        'dewpoint_C', 'relhum_percent', 'atmos_Pa', 'exthorrad_Whm2',
        'extdirrad_Whm2', 'horirsky_Whm2', 'glohorrad_Whm2', 'dirnorrad_Whm2',
        'difhorrad_Whm2', 'glohorillum_lux', 'dirnorillum_lux',
        'difhorillum_lux', 'zenlum_lux', 'winddir_deg', 'windspd_ms',
        'totskycvr_tenths', 'opaqskycvr_tenths', 'visibility_km',
        'ceiling_hgt_m', 'presweathobs', 'presweathcodes', 'precip_wtr_mm',
        'aerosol_opt_thousandths', 'snowdepth_cm', 'days_last_snow', 'Albedo',
        'liq_precip_depth_mm', 'liq_precip_rate_Hour'
    ]

    df = pd.read_csv(path_data,
                     skiprows=8,
                     header=None,
                     index_col=False,
                     usecols=list(range(0, 35)),
                     names=tmy_labels)  # .drop('datasource', axis=1)

    df['hour'] = df['hour'].astype(int)
    if df['hour'][0] == 1:
        # print('TMY file hours reduced from 1-24h to 0-23h')
        df['hour'] = df['hour'] - 1
    else:
        pass
        # print('TMY file hours maintained at 0-23hr')
    df['minute'] = 0

    if create_timeseries == False:
        pass
    else:
        df.set_index(ts_8760(df['year'].tolist()[0]), inplace=True)

    return df


def ts_8760(year=2023, tz=None):
    if tz is None:
        index = pd.date_range(start=f"01-01-{year} 00:00", end=f"12-31-{year} 23:00", freq="h")
    else:
        index = pd.date_range(start=f"01-01-2022 00:30", end=f"12-31-2022 23:30", freq="h", tz=tz)
    if calendar.isleap(year):
        index = index[~((index.month == 2) & (index.day == 29))]
    return index