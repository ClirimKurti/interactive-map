<?php

/*
Plugin Name: Interactive Map Plugin
Description: A plugin to create interactive maps with city reviews.
Version: 2.2.3
Author: Clirim Kurti
Text Domain: interactive-map
Domain Path: /languages
*/

if (!defined('ABSPATH')) {
    exit;
}

define('IMP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('IMP_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include Required Files
require_once IMP_PLUGIN_DIR . 'includes/class-interactive-map.php';
require_once IMP_PLUGIN_DIR . 'includes/settings.php';

function imp_initialize_plugin()
{
    $plugin = new Interactive_Map_Plugin();
    $plugin->init();
}
add_action('plugins_loaded', 'imp_initialize_plugin');

function imp_load_textdomain()
{
    load_plugin_textdomain('interactive-map', false, dirname(plugin_basename(__FILE__)) . '/languages');
}
add_action('init', 'imp_load_textdomain');

add_action('wp_head', 'imp_add_manifest');
function imp_add_manifest()
{
    echo '<link rel="manifest" href="' . IMP_PLUGIN_URL . 'public/manifest.json">';
    echo '<meta name="theme-color" content="#4a90e2">';
}

use YahnisElsts\PluginUpdateChecker\v5p4\PucFactory;

require_once plugin_dir_path(__FILE__) . 'lib/plugin-update-checker/plugin-update-checker.php';

$updateChecker = PucFactory::buildUpdateChecker(
    'https://ClirimKurti.github.io/plugin-update-info/plugin-info.json', // URL to the JSON file
    __FILE__, // Full path to the main plugin file
    'interactive-map' // Plugin slug (matches slug in JSON file)
);


// if (!defined('ABSPATH')) {
//     exit;
// }

// // Define Constants
// define('IMP_PLUGIN_DIR', plugin_dir_path(__FILE__));
// define('IMP_PLUGIN_URL', plugin_dir_url(__FILE__));


// function imp_enqueue_scripts()
// {
//     wp_enqueue_style('leaflet-css', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css');
//     wp_enqueue_script('leaflet-js', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', [], null, true);
//     wp_enqueue_style('openlayers-css', 'https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.9.0/css/ol.css');
//     wp_enqueue_script('openlayers-js', 'https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.9.0/build/ol.js', [], null, true);

//     wp_enqueue_style('imp-style', IMP_PLUGIN_URL . 'public/style.css');
//     wp_enqueue_script('imp-map-display', IMP_PLUGIN_URL . 'public/map-display.js', ['jquery'], null, true);

//     wp_localize_script('imp-map-display', 'impData', [
//         'mapUrl' => get_option('imp_map_url', ''),
//         'cityReviews' => get_option('imp_city_reviews', []),
//         'latitude' => get_option('imp_latitude', 0),
//         'longitude' => get_option('imp_longitude', 0),
//         'zoom' => get_option('imp_map_zoom', 1),
//         'state' => get_option('imp_state', ''),
//         'country' => get_option('imp_country', ''),
//         'googleMapsApiKey' => get_option('imp_google_maps_api_key', ''),
//         'stateBorderColor' => get_option('imp_state_border_color', ''),
//         'cityBorderColor' => get_option('imp_city_border_color', ''),
//         'displayCountryBorders' => get_option('imp_display_country_borders', false),
//         'mapStyle' => get_option('imp_map_style', 'osm'),
//         'customMarkerIcon' => get_option('imp_custom_marker_icon', ''),
//         'countryBorderColor' => get_option('imp_country_border_color', ''),
//         'boundingBox' => get_option('imp_bounding_box', false),
//         'tomtomAPIKey' => get_option('imp_api_key_tomtom', ''),
//         'displayAccidents' => get_option('imp_display_accidents', false),
//         'accidentsLimit' => get_option('imp_accidents_limit', 0),
//     ]);
// }

// function imp_enqueue_scripts_on_shortcode($hook)
// {
//     global $post;
//     if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'interactive_map')) {
//         imp_enqueue_scripts();
//     }
// }
// add_action('wp_enqueue_scripts', 'imp_enqueue_scripts_on_shortcode');


// // Enqueue Admin Scripts and Styles
// function imp_admin_scripts($hook)
// {
//     // Load scripts only on your plugin settings page
//     if ($hook === 'toplevel_page_interactive-map-plugin') {
//         wp_enqueue_script('imp-admin-script', IMP_PLUGIN_URL . 'admin/admin-script.js', ['jquery'], null, true);
//         wp_enqueue_style('imp-admin-style', IMP_PLUGIN_URL . 'admin/admin-style.css');
//         wp_enqueue_media();

//         wp_localize_script('imp-admin-script', 'impAdminData', [
//             'googleMapsApiKey' => get_option('imp_google_maps_api_key', ''),
//             'tomtomAPIKey' => get_option('imp_api_key_tomtom', '')
//         ]);
//         wp_localize_script('bounding-box-js', 'ajax_object', array(
//             'ajax_url' => admin_url('admin-ajax.php'),
//         ));
//     }
// }
// add_action('admin_enqueue_scripts', 'imp_admin_scripts');


// // Settings Page
// function imp_add_settings_page()
// {
//     add_menu_page(
//         'Interactive Map Settings',
//         'Interactive Map',
//         'manage_options',
//         'interactive-map-plugin',
//         'imp_render_settings_page'
//     );
// }
// add_action('admin_menu', 'imp_add_settings_page');

// // Render Settings Page
// function imp_render_settings_page()
// {
//     include IMP_PLUGIN_DIR . 'admin/settings-page.php';
// }

// // Register Plugin Settings
// function imp_register_settings()
// {
//     register_setting('imp_settings_group', 'imp_map_url');
//     register_setting('imp_settings_group', 'imp_latitude');
//     register_setting('imp_settings_group', 'imp_longitude');
//     register_setting('imp_settings_group', 'imp_city_reviews');
//     register_setting('imp_settings_group', 'imp_map_zoom');
//     register_setting('imp_settings_group', 'imp_google_maps_api_key');
//     register_setting('imp_settings_group', 'imp_state');
//     register_setting('imp_settings_group', 'imp_country');
//     register_setting('imp_settings_group', 'imp_state_border_color');
//     register_setting('imp_settings_group', 'imp_city_border_color');
//     register_setting('imp_settings_group', 'imp_display_country_borders');
//     register_setting('imp_settings_group', 'imp_select');
//     register_setting('imp_settings_group', 'imp_map_style');
//     register_setting('imp_settings_group', 'imp_custom_marker_icon');
//     register_setting('imp_settings_group', 'imp_country_border_color');
//     register_setting('imp_settings_group', 'imp_map_region');
//     register_setting('imp_settings_group', 'imp_bounding_box');
//     register_setting('imp_settings_group', 'imp_display_accidents');
//     register_setting('imp_settings_group', 'imp_api_key_tomtom');
//     register_setting('imp_settings_group', 'imp_accidents_limit');
// }
// add_action('admin_init', 'imp_register_settings');

// // Shortcode to Display Map
// function imp_display_map()
// {
//     ob_start();
//     return '<div id="interactive-map"></div>';
//     return ob_get_clean();
// }
// add_shortcode('interactive_map', 'imp_display_map');

// // AJAX Callback to Add WP Editor
// function add_wp_editor_callback()
// {
//     $editor_id = sanitize_text_field($_POST['editor_id']);
//     $textarea_name = sanitize_text_field($_POST['textarea_name']);

//     ob_start();
//     wp_editor('', $editor_id, [
//         'textarea_name' => $textarea_name,
//         'textarea_rows' => 5,
//         'media_buttons' => false,
//     ]);
//     $editor_html = ob_get_clean();

//     echo $editor_html;
//     wp_die();
// }
// add_action('wp_ajax_add_wp_editor', 'add_wp_editor_callback');

// function imp_activate_plugin()
// {
//     imp_register_settings();
//     set_transient('imp_plugin_activated', true, 30);
// }
// register_activation_hook(__FILE__, 'imp_activate_plugin');

// function imp_deactivate_plugin()
// {
//     delete_option('imp_map_url');
//     delete_option('imp_latitude');
//     delete_option('imp_longitude');
//     delete_option('imp_city_reviews');
//     delete_option('imp_map_zoom');
//     delete_option('imp_google_maps_api_key');
//     delete_option('imp_state');
//     delete_option('imp_country');
//     delete_option('imp_state_border_color');
//     delete_option('imp_city_border_color');
//     delete_option('imp_display_country_borders');
//     delete_option('imp_select');
//     delete_option('imp_map_style');
//     delete_option('imp_custom_marker_icon');
//     delete_option('imp_country_border_color');
//     delete_option('imp_map_region');
//     delete_option('imp_bounding_box');
//     delete_option('imp_display_accidents');
//     delete_option('imp_api_key_tomtom');
// }
// register_deactivation_hook(__FILE__, 'imp_deactivate_plugin');

// function imp_plugin_redirect()
// {
//     if (get_transient('imp_plugin_activated')) {
//         delete_transient('imp_plugin_activated');
//         if (is_admin()) {
//             wp_redirect(admin_url('admin.php?page=interactive-map-plugin'));
//             exit;
//         }
//     }
// }
// add_action('admin_init', 'imp_plugin_redirect');

// function find_shortcode_usage($shortcode)
// {
//     global $wpdb;

//     // Query the database for posts containing the shortcode
//     $results = $wpdb->get_col(
//         $wpdb->prepare(
//             "SELECT ID FROM {$wpdb->posts} 
//             WHERE post_content LIKE %s 
//             AND post_status = 'publish'",
//             '%' . $wpdb->esc_like($shortcode) . '%'
//         )
//     );

//     if (empty($results)) {
//         return null;
//     } elseif (count($results) === 1) {
//         return $results[0];
//     } else {
//         return $results;
//     }
// }
