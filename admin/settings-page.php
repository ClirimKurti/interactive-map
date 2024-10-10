<?php
// Handle file upload
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['imp_custom_marker_icon'])) {
        update_option('imp_custom_marker_icon', sanitize_text_field($_POST['imp_custom_marker_icon']));
    }
}

$custom_marker_icon = get_option('imp_custom_marker_icon', '');

?>
<div class="wrap">
    <h1>Interactive Map Settings</h1>
    <h2 class="nav-tab-wrapper">
        <a href="#tab-settings" class="nav-tab nav-tab-active">City Reviews</a>
        <a href="#tab-reviews" class="nav-tab">Settings</a>
        <a href="#bounding-box" class="nav-tab">Bounding Box</a>
    </h2>
    <form method="post" action="options.php">
        <?php settings_fields('imp_settings_group'); ?>
        <?php do_settings_sections('imp_settings_group'); ?>

        <div id="tab-settings" class="tab-content active">
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Map URL</th>
                    <td><input type="text" name="imp_map_url" value="<?php echo esc_attr(get_option('imp_map_url')); ?>" placeholder="Enter your map tile URL" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Google Maps URL</th>
                    <td>
                        <input type="text" id="google_maps_url" placeholder="Paste Google Maps URL here" />
                        <button type="button" id="parse_url_button">Find lat and lng</button>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Latitude</th>
                    <td><input type="text" id="latitude" name="imp_latitude" value="<?php echo esc_attr(get_option('imp_latitude')); ?>" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Longitude</th>
                    <td><input type="text" id="longitude" name="imp_longitude" value="<?php echo esc_attr(get_option('imp_longitude')); ?>" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Google Maps API Key</th>
                    <td><input type="password" name="imp_google_maps_api_key" value="<?php echo esc_attr(get_option('imp_google_maps_api_key')); ?>" placeholder="Enter your Google Maps API Key" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Map Zoom</th>
                    <td><input type="text" name="imp_map_zoom" value="<?php echo esc_attr(get_option('imp_map_zoom')); ?>" placeholder="Enter the map zoom level" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">State</th>
                    <td><input type="text" id="state" name="imp_state" value="<?php echo esc_attr(get_option('imp_state')); ?>" placeholder="Enter the state" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Country</th>
                    <td><input type="text" id="country" name="imp_country" value="<?php echo esc_attr(get_option('imp_country')); ?>" placeholder="Enter the country" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">City Reviews</th>
                    <td>
                        <div id="city-reviews-container">
                            <?php
                            $city_reviews = get_option('imp_city_reviews');
                            if (!empty($city_reviews)) {
                                foreach ($city_reviews as $index => $review) {
                            ?>
                                    <div class="city-review">
                                        <input type="text" name="imp_city_reviews[<?php echo $index; ?>][city]" value="<?php echo esc_attr($review['city']); ?>" placeholder="City Name" class="city-name" />
                                        <button type="button" class="get-lat-lng-button">Get Lat/Lng</button>
                                        <input type="text" name="imp_city_reviews[<?php echo $index; ?>][lat]" value="<?php echo esc_attr($review['lat']); ?>" placeholder="Latitude" class="latitude" />
                                        <input type="text" name="imp_city_reviews[<?php echo $index; ?>][lng]" value="<?php echo esc_attr($review['lng']); ?>" placeholder="Longitude" class="longitude" />
                                        <select name="imp_city_reviews[<?php echo $index; ?>][type]" class="city-type">
                                            <option value="city" <?php selected($review['type'], 'city'); ?>>City</option>
                                            <option value="state" <?php selected($review['type'], 'state'); ?>>State</option>
                                        </select>
                                        <?php
                                        wp_editor(
                                            $review['review'],
                                            'imp_city_reviews_' . $index . '_review',
                                            array(
                                                'textarea_name' => 'imp_city_reviews[' . $index . '][review]',
                                                'textarea_rows' => 5,
                                                'media_buttons' => false
                                            )
                                        );
                                        ?>
                                        <button type="button" class="remove-review-button">Remove</button>
                                    </div>
                            <?php
                                }
                            }
                            ?>
                        </div>
                        <button type="button" id="add-review-button">Add Review</button>
                    </td>
                </tr>
            </table>
        </div>
        <div id="tab-reviews" class="tab-content">
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">State Border Color</th>
                    <td><input type="color" name="imp_state_border_color" value="<?php echo esc_attr(get_option('imp_state_border_color')); ?>" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">City Border Color</th>
                    <td><input type="color" name="imp_city_border_color" value="<?php echo esc_attr(get_option('imp_city_border_color')); ?>" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Country Border Color</th>
                    <td>
                        <input type="color" id="imp_country_border_color" name="imp_country_border_color" value="<?php echo esc_attr(get_option('imp_country_border_color')); ?>" />
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Display Country Borders</th>
                    <td>
                        <label class="switch">
                            <input type="checkbox" id="imp_display_country_borders" name="imp_display_country_borders" <?php checked(get_option('imp_display_country_borders'), 'on'); ?>>
                            <span class="slider round"></span>
                        </label>
                        <span>Do you want to display borders to Country?</span>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Select Map Style</th>
                    <td>
                        <select name="imp_map_style">
                            <option value="osm" <?php selected(get_option('imp_map_style'), 'osm'); ?>>OpenStreetMap Standard</option>
                            <option value="bw" <?php selected(get_option('imp_map_style'), 'bw'); ?>>OpenStreetMap Black and White</option>
                            <option value="topo" <?php selected(get_option('imp_map_style'), 'topo'); ?>>OpenTopoMap</option>
                            <option value="watercolor" <?php selected(get_option('imp_map_style'), 'watercolor'); ?>>Stamen Watercolor</option>
                            <option value="terrain" <?php selected(get_option('imp_map_style'), 'terrain'); ?>>Stamen Terrain</option>
                        </select>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Custom Marker Icon <button type="button" class="remove-custom-marker-icon">Use Default</button></th>
                    <td>
                        <input type="text" id="imp_custom_marker_icon" name="imp_custom_marker_icon" value="<?php echo esc_url($custom_marker_icon); ?>" placeholder="No image selected" style="width: 60%;" />
                        <button type="button" id="upload_image_button" class="button">Upload Image</button>
                        <?php if ($custom_marker_icon): ?>
                            <img id="custom_marker_icon_preview" src="<?php echo esc_url($custom_marker_icon); ?>" alt="Custom Marker Icon" style="max-width: 100px; height: auto; display: block; margin-top: 10px;" />
                        <?php else: ?>
                            <img id="custom_marker_icon_preview" src="" alt="Custom Marker Icon" style="max-width: 100px; height: auto; display: none; margin-top: 10px;" />
                        <?php endif; ?>
                    </td>
                </tr>

            </table>
        </div>
        <div id="bounding-box" class="tab-content">
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Display Accidents</th>
                    <td>
                        <label class="switch">
                            <input type="checkbox" id="imp_display_accidents" name="imp_display_accidents" <?php checked(get_option('imp_display_accidents'), 'on'); ?>>
                            <span class="slider round"></span>
                        </label>
                        <span>Do you want to display Accidents?</span>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Enter the API Key</th>
                    <td>
                        <?php
                        $imp_api_key_tomtom = get_option('imp_api_key_tomtom');
                        ?>
                        <input type="password" id="imp_api_key_tomtom" name="imp_api_key_tomtom" value="<?php echo empty($imp_api_key_tomtom) ? '' : esc_attr($imp_api_key_tomtom); ?>" />
                        <span class="d-block mt-2">API Key should be from <a href="https://developer.tomtom.com/" target="_blank">TomTom</a></span>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Enter name of State/City</th>
                    <td>
                        <input type="text" id="imp_bounding_box" name="imp_bounding_box" value="<?= get_option('imp_bounding_box') ? get_option('imp_bounding_box') : '' ?>" placeholder="Enter State/City" />
                        <button type="button" id="get-bounding-box">Search</button>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Enter the limit of accidents to show</th>
                    <td>
                        <input type="text" id="imp_accidents_limit" name="imp_accidents_limit" value="<?= get_option('imp_accidents_limit') ? get_option('imp_accidents_limit') : 10 ?>" placeholder="Enter the limit of accidents to show" />
                    </td>
                </tr>
            </table>
            <div id="bounding-box-results"></div>
            <div id="bounding-box-accidents"></div>
        </div>
        <?php submit_button(); ?>
    </form>
</div>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        const parseUrlButton = document.getElementById('get-bounding-box');
        const boundingBoxInput = document.getElementById('imp_bounding_box');
        const boundingBoxResults = document.getElementById('bounding-box-results');

        parseUrlButton.addEventListener('click', function() {
            const regionName = boundingBoxInput.value.trim();
            if (!regionName) {
                alert('Please enter a state or city name.');
                return;
            }

            // Nominatim API URL to get the bounding box for the region
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(regionName)}&format=json&polygon_geojson=1`;

            // Fetch the data from the API
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.length > 0 && data[0].boundingbox) {
                        const boundingBox = data[0].boundingbox;
                        const minLat = parseFloat(boundingBox[0]);
                        const maxLat = parseFloat(boundingBox[1]);
                        const minLon = parseFloat(boundingBox[2]);
                        const maxLon = parseFloat(boundingBox[3]);

                        // Display the bounding box information
                        boundingBoxResults.innerHTML = `
                        <h2>Bounding Box for ${regionName}:</h2>
                        <p>[${minLon}, ${minLat}, ${maxLon}, ${maxLat}]</p>
                    `;
                    } else {
                        boundingBoxResults.innerHTML = `<p>Could not find bounding box for ${regionName}.</p>`;
                    }
                })
                .catch(error => {
                    console.error('Error fetching bounding box:', error);
                    boundingBoxResults.innerHTML = '<p>Error fetching bounding box. Please try again.</p>';
                });
        });
    });
</script>