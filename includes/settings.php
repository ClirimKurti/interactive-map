<?php

function imp_register_settings()
{
    register_setting('imp_settings_group', 'imp_latitude');
    register_setting('imp_settings_group', 'imp_longitude');
    register_setting('imp_settings_group', 'imp_map_url');
    register_setting('imp_settings_group', 'imp_latitude');
    register_setting('imp_settings_group', 'imp_longitude');
    register_setting('imp_settings_group', 'imp_city_reviews');
    register_setting('imp_settings_group', 'imp_map_zoom');
    register_setting('imp_settings_group', 'imp_google_maps_api_key');
    register_setting('imp_settings_group', 'imp_state');
    register_setting('imp_settings_group', 'imp_country');
    register_setting('imp_settings_group', 'imp_state_border_color');
    register_setting('imp_settings_group', 'imp_city_border_color');
    register_setting('imp_settings_group', 'imp_display_country_borders');
    register_setting('imp_settings_group', 'imp_select');
    register_setting('imp_settings_group', 'imp_map_style');
    register_setting('imp_settings_group', 'imp_custom_marker_icon');
    register_setting('imp_settings_group', 'imp_country_border_color');
    register_setting('imp_settings_group', 'imp_map_region');
    register_setting('imp_settings_group', 'imp_bounding_box');
    register_setting('imp_settings_group', 'imp_display_accidents');
    register_setting('imp_settings_group', 'imp_api_key_tomtom');
    register_setting('imp_settings_group', 'imp_accidents_limit');
}
