<?php

class Interactive_Map_Plugin
{

    public function init()
    {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_public_scripts']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);

        add_shortcode('interactive-map', [$this, 'render_map']);

        add_action('admin_menu', [$this, 'add_settings_page']);
        add_action('admin_init', 'imp_register_settings');
    }

    public function enqueue_public_scripts()
    {
        if ($this->is_map_page()) {
            wp_enqueue_style('leaflet-css', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css');
            wp_enqueue_script('leaflet-js', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', [], null, true);
            wp_enqueue_style('imp-style', IMP_PLUGIN_URL . 'public/css/style.css');
            wp_enqueue_script('imp-map-display', IMP_PLUGIN_URL . 'public/js/map-display.js', ['jquery'], null, true);
            echo '<link rel="manifest" href="' . IMP_PLUGIN_URL . 'public/manifest.json">';
            echo '<meta name="theme-color" content="#4a90e2">';
            wp_localize_script('imp-map-display', 'impData', $this->get_localized_script_data());
        }
    }

    public function enqueue_admin_scripts($hook)
    {
        if ($hook !== 'toplevel_page_imp-settings') {
            return;
        }

        wp_enqueue_style('imp-admin-style', IMP_PLUGIN_URL . 'admin/css/admin-style.css');
        wp_enqueue_script('imp-admin-js', IMP_PLUGIN_URL . 'admin/js/admin-script.js', ['jquery'], null, true);
    }

    public function render_map($atts)
    {
        ob_start();
        return '<div id="interactive-map" style="height: 500px;"></div>';
        return ob_get_clean();
    }

    public function add_settings_page()
    {
        add_menu_page(
            __('Interactive Map Settings', 'interactive-map'),
            __('Interactive Map', 'interactive-map'),
            'manage_options',
            'imp-settings',
            [$this, 'render_settings_page'],
            'dashicons-location-alt'
        );
    }

    public function render_settings_page()
    {
        require_once IMP_PLUGIN_DIR . 'admin/settings-page.php';
    }

    private function is_map_page()
    {
        global $post;
        return is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'interactive-map');
    }

    private function get_localized_script_data()
    {
        return [
            'mapUrl' => get_option('imp_map_url', ''),
            'cityReviews' => get_option('imp_city_reviews', []),
            'latitude' => get_option('imp_latitude', 0),
            'longitude' => get_option('imp_longitude', 0),
            'zoom' => get_option('imp_map_zoom', 1),
            'state' => get_option('imp_state', ''),
            'country' => get_option('imp_country', ''),
            'stateBorderColor' => get_option('imp_state_border_color', ''),
            'cityBorderColor' => get_option('imp_city_border_color', ''),
            'displayCountryBorders' => get_option('imp_display_country_borders', false),
            'mapStyle' => get_option('imp_map_style', 'osm'),
            'customMarkerIcon' => get_option('imp_custom_marker_icon', ''),
            'countryBorderColor' => get_option('imp_country_border_color', ''),
            'tomtomAPIKey' => get_option('imp_api_key_tomtom', ''),
            'displayAccidents' => get_option('imp_display_accidents', false),
            'accidentsLimit' => get_option('imp_accidents_limit', 0),
        ];
    }
}
