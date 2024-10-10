jQuery(document).ready(function ($) {
    var reviewIndex = $('#city-reviews-container .city-review').length;

    console.log('test');
    


    $('#parse_url_button').on('click', function () {
        var url = $('#google_maps_url').val();

        if (!url) {
            alert('URL is empty. Please provide a valid Google Maps URL.');
            return;
        }

        var latLng = getLatLngFromGoogleMapsURL(url);
        var city = getCityFromGoogleMapsURL(url);
        var country = getCountryFromGoogleMapsURL(url);

        if (latLng) {
            $('#latitude').val(latLng.lat);
            $('#longitude').val(latLng.lng);
            $('#state').val(city);
            $('#country').val(country);
        } else {
            alert('Invalid Google Maps URL');
        }
    });

    let debounceTimeout;
    $('#manual_state').on('input', function () {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            var city = $('#manual_city').val();
            var state = $('#manual_state').val();
            if (city && state) {
                fetchLatLngFromCityState(city, state, impAdminData.googleMapsApiKey);
            }
        }, 300);
    });

    function getLatLngFromGoogleMapsURL(url) {
        var regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        var match = regex.exec(url);
        if (match) {
            return { lat: match[1], lng: match[2] };
        } else {
            return null;
        }
    }

    function getCityFromGoogleMapsURL(url) {
        if (!isValidURL(url)) {
            alert('The provided URL is invalid.');
            return null;
        }

        url = url.replace('https://', '').replace('http://', '');
        let city = url.split("/")[3];
        city = city.split(',')[0].replace(/\+/g, ' ');
        return city;
    }

    function getCountryFromGoogleMapsURL(url) {
        if (!isValidURL(url)) {
            alert('The provided URL is invalid.');
            return null;
        }

        url = url.replace('https://', '').replace('http://', '');
        let country = url.split("/")[3];
        country = country.split(',').pop().replace(/\+/g, ' ');
        return country;
    }

    function isValidURL(string) {
        var res = string.match(/(http|https):\/\/(\w+:?\w*@)?(\S+)(:([0-9]+))?\/|\/([\w#!:.?+=&%@!\-\/])/);
        return (res !== null);
    }

    function fetchLatLngFromCityState(city, state, apiKey, retryCount = 3) {
        $.get('https://maps.googleapis.com/maps/api/geocode/json', { address: `${city},${state}`, key: apiKey }, function (data) {
            if (data.status === 'OK') {
                var location = data.results[0].geometry.location;
                var country = data.results[0].address_components.find(component => component.types.includes('country')).long_name;
                $('#latitude').val(location.lat);
                $('#longitude').val(location.lng);
                $('#country').val(country);
            } else {
                if (retryCount > 0) {
                    setTimeout(() => fetchLatLngFromCityState(city, state, apiKey, retryCount - 1), 1000);
                } else {
                    alert('Geocoding failed: ' + data.status);
                }
            }
        }).fail(function () {
            if (retryCount > 0) {
                setTimeout(() => fetchLatLngFromCityState(city, state, apiKey, retryCount - 1), 1000);
            } else {
                alert('Geocoding request failed.');
            }
        });
    }

    $('#add-review-button').on('click', function () {
        var newReviewId = 'imp_city_reviews_' + reviewIndex + '_review';
        var newReviewName = 'imp_city_reviews[' + reviewIndex + '][review]';

        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'add_wp_editor',
                editor_id: newReviewId,
                textarea_name: newReviewName
            },
            success: function (response) {
                var newReviewHtml = `
                    <div class="city-review">
                        <input type="text" name="imp_city_reviews[${reviewIndex}][city]" placeholder="City Name" class="city-name" />
                        <button type="button" class="get-lat-lng-button">Get Lat/Lng</button>
                        <input type="text" name="imp_city_reviews[${reviewIndex}][lat]" placeholder="Latitude" class="latitude" />
                        <input type="text" name="imp_city_reviews[${reviewIndex}][lng]" placeholder="Longitude" class="longitude" />
                        <select name="imp_city_reviews[${reviewIndex}][type]" class="city-type">
                            <option value="city">City</option>
                            <option value="state">State</option>
                        </select>
                        <div class="wp-editor-container">${response}</div>
                        <button type="button" class="remove-review-button">Remove</button>
                    </div>
                `;

                $('#city-reviews-container').append(newReviewHtml);

                // Initialize the newly added TinyMCE editor
                tinymce.init({
                    selector: `#${newReviewId}`,
                    setup: function (editor) {
                        editor.on('change', function () {
                            editor.save();
                        });
                    }
                });

                // Initialize Quicktags
                quicktags({ id: newReviewId });

                reviewIndex++;
            }
        });
    });

    $('#city-reviews-container').on('click', '.remove-review-button', function () {
        var editorId = $(this).siblings('.wp-editor-container').find('textarea').attr('id');
        tinymce.execCommand('mceRemoveEditor', true, editorId);
        $(this).closest('.city-review').remove();
    });

    $('#city-reviews-container').on('click', '.get-lat-lng-button', function () {
        var apiKey = impAdminData.googleMapsApiKey;
        var $parent = $(this).closest('.city-review');
        var city = $parent.find('.city-name').val();

        if (city && apiKey) {
            $.get('https://maps.googleapis.com/maps/api/geocode/json', { address: city, key: apiKey }, function (data) {
                if (data.status === 'OK') {
                    var location = data.results[0].geometry.location;
                    $parent.find('.latitude').val(location.lat);
                    $parent.find('.longitude').val(location.lng);
                } else {
                    alert('Geocoding failed: ' + data.status);
                }
            }).fail(function () {
                alert('Geocoding request failed.');
            });
        } else {
            alert('Please enter a city name and ensure API key is set.');
        }
    });

    $('.nav-tab').on('click', function (e) {
        e.preventDefault();
        $('.nav-tab').removeClass('nav-tab-active');
        $(this).addClass('nav-tab-active');

        $('.tab-content').removeClass('active');
        $($(this).attr('href')).addClass('active');
    });

    $('.nav-tab-wrapper .nav-tab:first').trigger('click');

    var customUploader;

    $('#upload_image_button').click(function (e) {
        e.preventDefault();

        if (customUploader) {
            customUploader.open();
            return;
        }

        customUploader = wp.media.frames.file_frame = wp.media({
            title: 'Choose Image',
            button: {
                text: 'Choose Image'
            },
            multiple: false
        });

        customUploader.on('select', function () {
            var attachment = customUploader.state().get('selection').first().toJSON();
            $('#imp_custom_marker_icon').val(attachment.url);
            $('#custom_marker_icon_preview').attr('src', attachment.url);
        });

        customUploader.open();
    });

    $('.remove-custom-marker-icon').on('click', function (e) {
        e.preventDefault();
        $('#imp_custom_marker_icon').val('');
        $('#custom_marker_icon_preview').hide();
    });

    function toggleColorInput() {
        if ($('#imp_display_country_borders').is(':checked')) {
            $('#imp_country_border_color').closest('tr').show();
        } else {
            $('#imp_country_border_color').closest('tr').hide();
        }
        if ($('#imp_display_accidents').is(':checked')) {
            $('#imp_bounding_box').closest('tr').show();
            $('#imp_api_key_tomtom').closest('tr').show();
            $('#imp_accidents_limit').closest('tr').show();
        } else {
            $('#imp_bounding_box').closest('tr').hide();
            $('#imp_api_key_tomtom').closest('tr').hide();
            $('#imp_accidents_limit').closest('tr').hide();
        }
    }

    toggleColorInput();

    $('#imp_display_country_borders').change(function () {
        toggleColorInput();
    });

    $('#imp_display_accidents').change(function () {
        toggleColorInput();
    });

    const parseUrlButton = $('#get-bounding-box');
    const boundingBoxInput = $('#imp_bounding_box');
    const boundingBoxResults = $('#bounding-box-results');
    const boundingBoxAccidents = $('#bounding-box-accidents');

    parseUrlButton.on('click', function () {
        const regionName = boundingBoxInput.val().trim();
        if (!regionName) {
            alert('Please enter a state or city name.');
            return;
        }
        var tomtomAPIKey = impAdminData.tomtomAPIKey;
        var bbox = '-100.5292906, 31.3355045, -100.3599256, 31.5264855';
        var incidentTypes = '1';

        function getIncidentType(iconCategory) {
            switch (iconCategory) {
                case 1:
                    return 'Accident';
                default:
                    return 'Incident';
            }
        }
        // get the bounding box for the region
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(regionName)}&format=json&polygon_geojson=1`;
        var getData = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${tomtomAPIKey}&bbox=${bbox}&fields={incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,from,to,length,delay,roadNumbers,timeValidity}}}&categories=${incidentTypes}&language=en-GB&t=1111&timeValidityFilter=present`;

        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function (data) {

                $.ajax({
                    url: getData,
                    method: 'GET',
                    success: function (data) {
                        var incidents = data.incidents;
                        var count = 0;

                        if (incidents && incidents.length > 0) {
                            boundingBoxAccidents.html(`
                                <p> Found ${incidents.length} incidents. </p>
                            `);
                        } else {
                            console.log("No incidents found for the given bounding box.");
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Error fetching incidents:", status, error);
                        console.error("Response Text:", xhr.responseText);
                    }
                });

                if (data && data.length > 0 && data[0].boundingbox) {
                    const boundingBox = data[0].boundingbox;
                    const minLat = parseFloat(boundingBox[0]);
                    const maxLat = parseFloat(boundingBox[1]);
                    const minLon = parseFloat(boundingBox[2]);
                    const maxLon = parseFloat(boundingBox[3]);

                    // Calculate the area of the bounding box
                    const latDifference = maxLat - minLat;
                    const lonDifference = maxLon - minLon;
                    const kmPerDegreeLat = 111;
                    const kmPerDegreeLon = 111 * Math.cos((minLat + maxLat) / 2 * Math.PI / 180);

                    // Approximate area in square kilometers
                    const areaKm2 = latDifference * lonDifference * kmPerDegreeLat * kmPerDegreeLon;

                    // Check if the area exceeds 10,000 km²
                    if (areaKm2 > 10000) {
                        boundingBoxResults.html(`
                            <h2>Bounding Box for ${regionName}:</h2>
                            <p>[${minLon}, ${minLat}, ${maxLon}, ${maxLat}]</p>
                            <p><strong>Note:</strong> The area of this region is approximately ${areaKm2.toFixed(2)} km², which is larger than 10,000 km², so this is not going to show you any data.</p>
                        `);
                    } else {
                        boundingBoxResults.html(`
                            <h2>Bounding Box for ${regionName}:</h2>
                            <p>[${minLon}, ${minLat}, ${maxLon}, ${maxLat}]</p>
                            <p>The area of this region is approximately ${areaKm2.toFixed(2)} km².</p>
                        `);
                    }
                } else {
                    boundingBoxResults.html(`<p>Could not find bounding box for ${regionName}.</p>`);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching bounding box:', error);
                boundingBoxResults.html('<p>Error fetching bounding box. Please try again.</p>');
            }
        });
    });
});
