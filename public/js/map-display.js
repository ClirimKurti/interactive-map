jQuery(document).ready(function ($) {

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/wp-content/plugins/interactive-map/public/js/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    }

    const {
        cityReviews, state, country, latitude, longitude, zoom,
        stateBorderColor, cityBorderColor, displayCountryBorders,
        locateControl, countryBorderColor, customMarkerIcon, mapStyle
    } = impData;

    const map = initializeMap(latitude, longitude, zoom, mapStyle);

    if (locateControl) addGeolocationControl(map);
    if (displayCountryBorders) addBorders(map, 'country', country, countryBorderColor);
    addBorders(map, 'state', state, stateBorderColor);

    map.on('moveend', function () {
        const bounds = map.getBounds();
        if (Array.isArray(cityReviews)) {
            cityReviews.forEach((city) => {
                const cityLatLng = L.latLng(city.lat, city.lng);
                if (bounds.contains(cityLatLng)) {
                    if (!city._loaded) {
                        const marker = createCityMarker(map, city, customMarkerIcon);
                        marker.bindPopup(`<strong>${city.city}</strong><br>${city.review}`);
                        addCityBorder(map, city, country, stateBorderColor, cityBorderColor);
                        city._loaded = true;
                    }
                }
            });
        }
    });

    function initializeMap(latitude, longitude, zoom, mapStyle) {
        const map = L.map('interactive-map').setView([latitude, longitude], zoom);
        const layers = getMapLayers();
        layers[mapStyle].addTo(map);
        return map;
    }

    function getMapLayers() {
        return {
            'osm': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }),
            'bw': L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }),
            'topo': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
            }),
            'watercolor': L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', {
                attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under ODbL.'
            }),
            'terrain': L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg', {
                attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under ODbL.'
            })
        };
    }
    function setCache(key, data, ttl = 86400) {
        const expiryTime = Date.now() + ttl * 1000;
        const cacheData = { data, expiryTime };
        localStorage.setItem(key, JSON.stringify(cacheData));
    }

    function getCache(key) {
        const cacheItem = localStorage.getItem(key);
        if (!cacheItem) return null;

        const { data, expiryTime } = JSON.parse(cacheItem);
        if (Date.now() > expiryTime) {
            localStorage.removeItem(key);
            return null;
        }

        return data;
    }

    function addGeolocationControl(map) {
        const locateControl = L.control({ position: 'topright' });
        locateControl.onAdd = () => createLocateControl();
        locateControl.addTo(map);

        $('#locate-btn').on('click', (e) => {
            e.preventDefault();
            getUserLocation(map);
        });
    }

    function createLocateControl() {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.innerHTML = '<a href="#" title="Show My Location" id="locate-btn" style="background: white; padding: 8px;"><i class="fas fa-location-arrow"></i></a>';
        return div;
    }

    function getUserLocation(map) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => updateUserLocation(map, position),
                handleGeolocationError
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    function updateUserLocation(map, position) {
        const { latitude, longitude } = position.coords;
        const userMarker = L.marker([latitude, longitude]).addTo(map);
        map.setView([latitude, longitude], 13);
        userMarker.bindPopup('<strong>Your Location</strong>').openPopup();
    }

    function handleGeolocationError(error) {
        const errorMessages = {
            1: "User denied the request for Geolocation. Please allow location access in your browser settings and reload the page.",
            2: "Location information is unavailable.",
            3: "The request to get user location timed out.",
            default: "An unknown error occurred."
        };
        alert(errorMessages[error.code] || errorMessages.default);
        console.error("Geolocation error: ", error);
    }

    async function addBorders(map, type, name, borderColor) {
        const cacheKey = `${type}-${name}-border`;
        const cachedData = getCache(cacheKey);

        if (cachedData) {
            L.geoJson(cachedData, { style: getBorderStyle(borderColor) })
                .addTo(map)
                .bindPopup(`${name} Border`);
            return;
        }

        const query = `${type}=${name}&format=json&polygon_geojson=1`;
        try {
            const response = await $.getJSON(`https://nominatim.openstreetmap.org/search?${query}`);
            if (response && response.length > 0 && response[0].geojson) {
                L.geoJson(response[0].geojson, { style: getBorderStyle(borderColor) })
                    .addTo(map)
                    .bindPopup(`${name} Border`);
                setCache(cacheKey, response[0].geojson);
            } else {
                console.warn(`No geojson data found for ${name}`);
            }
        } catch (error) {
            console.error(`Error fetching geojson for ${name}:`, error);
        }
    }

    function getBorderStyle(borderColor) {
        return {
            color: borderColor,
            weight: 2,
            opacity: 0.6
        };
    }

    function createCityMarker(map, city, customMarkerIcon) {
        const iconOptions = customMarkerIcon ? {
            iconUrl: customMarkerIcon,
            iconSize: [38, 95],
            iconAnchor: [22, 94],
            popupAnchor: [-3, -76]
        } : null;

        const markerOptions = iconOptions ? { icon: L.icon(iconOptions) } : {};
        return L.marker([city.lat, city.lng], markerOptions).addTo(map);
    }

    function addCityBorder(map, city, country, stateBorderColor, cityBorderColor) {
        const query = `${city.type}=${city.city}&country=${country}&format=json&polygon_geojson=1`;
        $.getJSON(`https://nominatim.openstreetmap.org/search?${query}`, (cityData) => {
            if (cityData && cityData.length > 0 && cityData[0].geojson) {
                L.geoJson(cityData[0].geojson, {
                    style: getCityBorderStyle(city, stateBorderColor, cityBorderColor)
                }).addTo(map).bindPopup(`${city.city} Border`);
            } else {
                console.warn(`No geojson data found for ${city.city}`);
            }
        }).fail((jqxhr, textStatus, error) => {
            console.error(`Request failed for ${city.city}: ${textStatus}, ${error}`);
        });
    }

    function getCityBorderStyle(city, stateBorderColor, cityBorderColor) {
        return {
            color: city.type === "state" ? stateBorderColor : cityBorderColor,
            weight: 2,
            opacity: 1
        };
    }
});

// if (displayAccidents) {
//     var bbox = '-100.5292906, 31.3355045, -100.3599256, 31.5264855';
//     var incidentTypes = '1';

//     var url = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${tomtomAPIKey}&bbox=${bbox}&fields={incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,from,to,length,delay,roadNumbers,timeValidity}}}&categories=${incidentTypes}&language=en-GB&t=1111&timeValidityFilter=present`;

//     function getIncidentType(iconCategory) {
//         switch (iconCategory) {
//             case 1:
//                 return 'Accident';
//             default:
//                 return 'Incident';
//         }
//     }

//     $.ajax({
//         url: url,
//         method: 'GET',
//         success: function (data) {
//             var incidents = data.incidents;
//             var count = 0;

//             if (incidents && incidents.length > 0) {
//                 console.log(incidents);

//                 incidents.forEach(function (incident) {
//                     var geometry = incident.geometry;
//                     var properties = incident.properties;

//                     var iconCategory = properties.iconCategory;
//                     var description = properties.events && properties.events[0] ? properties.events[0].description : 'No description available';
//                     var startTime = properties.startTime ? new Date(properties.startTime).toLocaleString() : 'Unknown';
//                     var endTime = properties.endTime ? new Date(properties.endTime).toLocaleString() : 'Unknown';
//                     var delay = properties.delay ? properties.delay + ' mins' : 'No delay reported';
//                     var roadNumbers = properties.roadNumbers ? properties.roadNumbers.join(', ') : 'No roads affected';

//                     if (count < accidentsLimit) {
//                         count++;

//                         var incidentType = getIncidentType(iconCategory);

//                         var popupContent = `<strong>Type:</strong> ${incidentType}<br>
//                                         <strong>Description:</strong> ${description}<br>
//                                         <strong>Start Time:</strong> ${startTime}<br>
//                                         <strong>End Time:</strong> ${endTime}<br>
//                                         <strong>Delay:</strong> ${delay}<br>
//                                         <strong>Roads Affected:</strong> ${roadNumbers}`;


//                         if (geometry.type === 'LineString') {
//                             var polylineCoordinates = geometry.coordinates.map(function (coord) {
//                                 return [coord[1], coord[0]]; // Lat, Lng
//                             });
//                             var polyline = L.polyline(polylineCoordinates, { color: 'red' }).addTo(map);

//                             polyline.bindPopup(popupContent);

//                             var midpoint = polylineCoordinates[Math.floor(polylineCoordinates.length / 2)];
//                             L.marker(midpoint).addTo(map).bindPopup(popupContent);

//                         } else if (geometry.type === 'Point') {
//                             var lat = geometry.coordinates[1];
//                             var lng = geometry.coordinates[0];

//                             var marker = L.marker([lat, lng]).addTo(map);
//                             marker.bindPopup(popupContent);
//                         }

//                         if (count >= accidentsLimit) {
//                             return false;
//                         }
//                     }
//                 });
//             } else {
//                 console.log("No incidents found for the given bounding box.");
//             }
//         },
//         error: function (xhr, status, error) {
//             console.error("Error fetching incidents:", status, error);
//             console.error("Response Text:", xhr.responseText);
//         }
//     });
// }


// jQuery(document).ready(function ($) {
//     if (typeof impData !== 'undefined' && $('#interactive-map').length) {
//         var cityReviews = Object.values(impData.cityReviews);
//         var state = impData.state;
//         var country = impData.country;
//         var latitude = impData.latitude;
//         var longitude = impData.longitude;
//         var zoom = impData.zoom;
//         var stateColor = impData.stateBorderColor;
//         var cityBorderColor = impData.cityBorderColor;
//         var displayCountryBorders = impData.displayCountryBorders;

//         var map = new maptalks.Map('interactive-map', {
//             center: [longitude, latitude],
//             zoom: zoom,
//             pitch: 45,
//             baseLayer: new maptalks.TileLayer('base', {
//                 urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
//                 subdomains: ['a', 'b', 'c'],
//                 attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             })
//         });

//         var vectorLayer = new maptalks.VectorLayer('vector').addTo(map);

//         // Add city reviews markers
//         if (Array.isArray(cityReviews)) {
//             cityReviews.forEach(function (city) {
//                 var marker = new maptalks.Marker(
//                     [city.lng, city.lat],
//                     {
//                         symbol: {
//                             'markerFile': impData.customMarkerIcon || 'https://maptalks.org/maptalks/examples/resource/images/marker.png',
//                             'markerWidth': 30,
//                             'markerHeight': 40,
//                             'markerDx': 0,
//                             'markerDy': 0,
//                             'markerOpacity': 1
//                         }
//                     }
//                 ).addTo(vectorLayer);
//                 marker.setInfoWindow({
//                     title: city.city,
//                     content: '<p>' + city.review + '</p>'
//                 });
//                 marker.openInfoWindow();
//             });
//         }

//         // Initialize 3D layer
//         var threeLayer = new maptalks.ThreeLayer('t', {
//             forceRenderOnMoving: true,
//             forceRenderOnRotating: true
//         }).addTo(map);

//         threeLayer.prepareToDraw = function (gl, scene, camera) {
//             var light = new THREE.DirectionalLight(0xffffff);
//             light.position.set(0, -10, 10).normalize();
//             scene.add(light);

//             var geometry = new THREE.BoxGeometry(100000, 100000, 100000);
//             var material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
//             var mesh = new THREE.Mesh(geometry, material);
//             scene.add(mesh);
//         };

//         // Add Geolocation Button
//         var locateControl = new maptalks.control.Toolbar({
//             items: [{
//                 item: 'Locate Me',
//                 click: function () {
//                     if (navigator.geolocation) {
//                         navigator.geolocation.getCurrentPosition(function (position) {
//                             var userLat = position.coords.latitude;
//                             var userLng = position.coords.longitude;
//                             var userMarker = new maptalks.Marker([userLng, userLat]).addTo(vectorLayer);
//                             map.setCenter([userLng, userLat]);
//                             userMarker.setInfoWindow({
//                                 title: 'Your Location',
//                                 content: '<strong>Your Location</strong>'
//                             }).openInfoWindow();
//                         }, function (error) {
//                             switch (error.code) {
//                                 case error.PERMISSION_DENIED:
//                                     alert("User denied the request for Geolocation. Please allow location access in your browser settings and reload the page.");
//                                     break;
//                                 case error.POSITION_UNAVAILABLE:
//                                     alert("Location information is unavailable.");
//                                     break;
//                                 case error.TIMEOUT:
//                                     alert("The request to get user location timed out.");
//                                     break;
//                                 case error.UNKNOWN_ERROR:
//                                     alert("An unknown error occurred.");
//                                     break;
//                             }
//                             console.error("Geolocation error: ", error);
//                         });
//                     } else {
//                         alert('Geolocation is not supported by this browser.');
//                     }
//                 }
//             }]
//         });

//         map.addControl(locateControl);

//         // Find location borders
//         function addGeoJsonBorders(url, color) {
//             $.getJSON(url, function (data) {
//                 if (data && data[0] && data[0].geojson) {
//                     new maptalks.GeoJSONVectorTileLayer('geojson', data[0].geojson, {
//                         symbol: {
//                             lineColor: color,
//                             lineWidth: 2,
//                             lineOpacity: 0.6
//                         }
//                     }).addTo(map);
//                 }
//             });
//         }

//         // console.log(displayCountryBorders);
//         if (displayCountryBorders) {
//             addGeoJsonBorders(`https://nominatim.openstreetmap.org/search?country=${country}&format=json&polygon_geojson=1`, '#0000FF');
//         }

//         addGeoJsonBorders(`https://nominatim.openstreetmap.org/search?state=${state}&country=${country}&format=json&polygon_geojson=1`, stateColor);

//         if (Array.isArray(cityReviews)) {
//             cityReviews.forEach(function (city) {
//                 var query = city.type === "state" ? `state=${city.city}&country=${country}` : `city=${city.city}&country=${country}`;
//                 addGeoJsonBorders(`https://nominatim.openstreetmap.org/search?${query}&format=json&polygon_geojson=1`, cityBorderColor);
//             });
//         }

//         // Route Planning
//         var control = new maptalks.control.Toolbar({
//             items: [
//                 {
//                     item: 'Start Route',
//                     click: function () {
//                         map.on('click', addRouteWaypoint);
//                     }
//                 },
//                 {
//                     item: 'Clear Route',
//                     click: function () {
//                         map.off('click', addRouteWaypoint);
//                         clearRoute();
//                     }
//                 }
//             ]
//         }).addTo(map);

//         var waypoints = [];
//         var routeLayer = new maptalks.VectorLayer('route').addTo(map);

//         function addRouteWaypoint(e) {
//             var coord = e.coordinate.toArray();
//             waypoints.push(coord);
//             new maptalks.Marker(coord).addTo(routeLayer);

//             if (waypoints.length > 1) {
//                 planRoute();
//             }
//         }

//         function clearRoute() {
//             waypoints = [];
//             routeLayer.clear();
//         }

//         function planRoute() {
//             if (waypoints.length < 2) return;
//             var url = `https://router.project-osrm.org/route/v1/driving/${waypoints.map(p => p.join(',')).join(';')}?overview=full&geometries=geojson`;
//             $.getJSON(url, function (data) {
//                 if (data.routes && data.routes.length > 0) {
//                     var route = data.routes[0].geometry;
//                     new maptalks.GeoJSONVectorLayer('route', route, {
//                         symbol: {
//                             lineColor: '#FF0000',
//                             lineWidth: 3,
//                             lineOpacity: 0.8
//                         }
//                     }).addTo(routeLayer);
//                 }
//             });
//         }
//     } else {
//         console.error('impData is undefined or #interactive-map element not found.');
//     }
// });
