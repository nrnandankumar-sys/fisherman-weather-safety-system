import { supabase } from "./supabase-config.js";

document.addEventListener("DOMContentLoaded", function () {

    /* ============================================================
       AUTH CHECK
    ============================================================ */

    if (localStorage.getItem("isLoggedIn") !== "true") {
        alert("Please Login First");
        window.location.href = "main.html";
        return;
    }

    if (localStorage.getItem("isRegistered") !== "true") {
        const register = confirm(
            "Fuel Route Optimizer is available only for registered fishermen.\n\n" +
            "Would you like to register now?"
        );

        if (register) {
            window.location.href = "register.html";
        } else {
            window.location.href = "main.html";
        }

        return;
    }

    /* ============================================================
       CURRENT USER
    ============================================================ */

    let currentUser = null;

    try {
        currentUser = JSON.parse(
            localStorage.getItem("currentUser") || "null"
        );
    } catch (error) {
        console.error("Unable to read current user:", error);
    }

    if (!currentUser) {
        currentUser = {
            id: localStorage.getItem("user_id") || null,
            name: localStorage.getItem("user_name") || "",
            phone: localStorage.getItem("user_phone") || ""
        };
    }

    /* ============================================================
       NAVIGATION
    ============================================================ */

    const menuIcon = document.getElementById("menuIcon");
    const navLinks = document.getElementById("navLinks");

    if (menuIcon && navLinks) {
        menuIcon.addEventListener("click", function () {
            navLinks.classList.toggle("active");
        });
    }

    /* ============================================================
       DOM ELEMENTS
    ============================================================ */

    const currentLocation =
        document.getElementById("currentLocation");

    const destination =
        document.getElementById("destination");

    const boatType =
        document.getElementById("boatType");

    const fuelAvailable =
        document.getElementById("fuelAvailable");

    const fuelPrice =
        document.getElementById("fuelPrice");

    const temperature =
        document.getElementById("temperature");

    const wind =
        document.getElementById("wind");

    const weather =
        document.getElementById("weather");

    const sea =
        document.getElementById("sea");

    const distance =
        document.getElementById("distance");

    const fuelNeed =
        document.getElementById("fuelNeed");

    const fuelCost =
        document.getElementById("fuelCost");

    const travelTime =
        document.getElementById("travelTime");

    const safetyScore =
        document.getElementById("safetyScore");

    const tripHistory =
        document.getElementById("tripHistory");

    const locationBtn =
        document.getElementById("locationBtn");

    const calculateBtn =
        document.getElementById("calculateBtn");

    /* ============================================================
       RESULT / ROUTE OPTIMIZATION DISPLAY
    ============================================================ */

    let resultContainer =
        document.getElementById("routeOptimizationResult");

    if (!resultContainer) {

        resultContainer = document.createElement("div");

        resultContainer.id =
            "routeOptimizationResult";

        resultContainer.style.marginTop = "20px";
        resultContainer.style.padding = "20px";
        resultContainer.style.borderRadius = "15px";
        resultContainer.style.background =
            "rgba(0, 30, 60, 0.85)";
        resultContainer.style.color = "white";
        resultContainer.style.boxShadow =
            "0 8px 25px rgba(0,0,0,0.3)";
        resultContainer.style.lineHeight = "1.8";

        if (calculateBtn && calculateBtn.parentElement) {
            calculateBtn.parentElement.appendChild(
                resultContainer
            );
        } else if (distance && distance.parentElement) {
            distance.parentElement.parentElement.appendChild(
                resultContainer
            );
        }
    }

    /* ============================================================
       OPENWEATHER
    ============================================================ */

    const API_KEY =
        "00635e07f8b20b8f0d5335fc43245700";

    /* ============================================================
       MAP
    ============================================================ */

    const mapElement =
        document.getElementById("map");

    if (!mapElement) {
        console.error("Map element #map was not found.");
        return;
    }

    const map = L.map("map").setView(
        [15.9129, 79.7400],
        7
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

    let currentMarker = null;
    let destinationMarker = null;
    let routeLine = null;
    let optimizedRouteLine = null;

    /* ============================================================
       MAP SIZE
    ============================================================ */

    setTimeout(function () {
        map.invalidateSize();
    }, 500);

    window.addEventListener("resize", function () {
        map.invalidateSize();
    });

    /* ============================================================
       BOAT FUEL RATE
    ============================================================ */

    const FUEL_RATE_PER_KM = {

        "Small Boat": 0.4,

        "Medium Boat": 0.7,

        "Large Boat": 1.2,

        "Trawler": 1.6
    };

    /* ============================================================
       BOAT SPEED
    ============================================================ */

    const SPEED_KMH = {

        "Small Boat": 15,

        "Medium Boat": 20,

        "Large Boat": 25,

        "Trawler": 18
    };

    /* ============================================================
       LOCATION BUTTON
    ============================================================ */

    if (locationBtn) {
        locationBtn.addEventListener(
            "click",
            getCurrentLocation
        );
    }

    /* ============================================================
       CALCULATE BUTTON
    ============================================================ */

    if (calculateBtn) {
        calculateBtn.addEventListener(
            "click",
            calculateRoute
        );
    }

    /* ============================================================
       GET CURRENT LOCATION
    ============================================================ */

    function getCurrentLocation() {

        if (!navigator.geolocation) {
            alert(
                "Geolocation is not supported on this device."
            );
            return;
        }

        if (locationBtn) {
            locationBtn.disabled = true;
            locationBtn.textContent =
                "Getting Location...";
        }

        navigator.geolocation.getCurrentPosition(

            async function (position) {

                const lat =
                    position.coords.latitude;

                const lng =
                    position.coords.longitude;

                localStorage.setItem(
                    "user_latitude",
                    lat
                );

                localStorage.setItem(
                    "user_longitude",
                    lng
                );

                if (currentMarker) {

                    currentMarker.setLatLng([
                        lat,
                        lng
                    ]);

                } else {

                    currentMarker =
                        L.marker([
                            lat,
                            lng
                        ])
                        .addTo(map)
                        .bindPopup(
                            "<b>Current Location</b><br>" +
                            lat.toFixed(6) +
                            ", " +
                            lng.toFixed(6)
                        );
                }

                currentMarker.openPopup();

                map.setView(
                    [lat, lng],
                    10
                );

                await reverseGeocode(
                    lat,
                    lng
                );

                await fetchWeather(
                    lat,
                    lng
                );

                if (locationBtn) {
                    locationBtn.disabled = false;
                    locationBtn.textContent =
                        "Get Current Location";
                }
            },

            function (error) {

                console.error(
                    "Geolocation error:",
                    error
                );

                if (locationBtn) {
                    locationBtn.disabled = false;
                    locationBtn.textContent =
                        "Get Current Location";
                }

                if (error.code === 1) {
                    alert(
                        "Please allow location permission."
                    );
                } else if (error.code === 2) {
                    alert(
                        "Unable to determine your location."
                    );
                } else if (error.code === 3) {
                    alert(
                        "Location request timed out."
                    );
                } else {
                    alert(
                        "Unable to get your current location."
                    );
                }
            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    }

    /* ============================================================
       REVERSE GEOCODING
    ============================================================ */

    async function reverseGeocode(
        lat,
        lng
    ) {

        if (!currentLocation) {
            return;
        }

        try {

            const response =
                await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                    {
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Reverse geocoding failed"
                );
            }

            const data =
                await response.json();

            const address =
                data.address || {};

            const place =
                address.village ||
                address.town ||
                address.city ||
                address.municipality ||
                address.county ||
                address.state ||
                data.display_name ||
                `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

            currentLocation.value = place;

            localStorage.setItem(
                "user_location",
                place
            );

        } catch (error) {

            console.error(
                "Reverse geocoding error:",
                error
            );

            currentLocation.value =
                `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    }

    /* ============================================================
       WEATHER
    ============================================================ */

    async function fetchWeather(
        lat,
        lng
    ) {

        try {

            const response =
                await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${API_KEY}`
                );

            if (!response.ok) {
                throw new Error(
                    "Weather API failed"
                );
            }

            const data =
                await response.json();

            if (temperature) {

                temperature.textContent =
                    Math.round(
                        data.main.temp
                    ) + "°C";
            }

            const windKmh =
                Number(data.wind?.speed || 0) *
                3.6;

            if (wind) {

                wind.textContent =
                    Math.round(
                        windKmh
                    ) + " km/h";
            }

            if (weather) {

                weather.textContent =
                    data.weather?.[0]?.description ||
                    "N/A";
            }

            if (sea) {

                if (windKmh > 40) {

                    sea.textContent =
                        "Rough";

                } else if (windKmh > 20) {

                    sea.textContent =
                        "Moderate";

                } else {

                    sea.textContent =
                        "Calm";
                }
            }

        } catch (error) {

            console.error(
                "Weather error:",
                error
            );

            if (temperature)
                temperature.textContent = "--";

            if (wind)
                wind.textContent = "--";

            if (weather)
                weather.textContent =
                    "Unavailable";

            if (sea)
                sea.textContent =
                    "Unknown";
        }
    }

    /* ============================================================
       DESTINATION GEOCODING
    ============================================================ */

    async function geocodeDestination(
        destinationName
    ) {

        const response =
            await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(destinationName)}`,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );

        if (!response.ok) {
            throw new Error(
                "Destination search failed"
            );
        }

        const data =
            await response.json();

        if (
            !data ||
            data.length === 0
        ) {
            throw new Error(
                "Destination not found"
            );
        }

        return {
            lat: parseFloat(
                data[0].lat
            ),
            lng: parseFloat(
                data[0].lon
            )
        };
    }

    /* ============================================================
       HAVERSINE DISTANCE
    ============================================================ */

    function haversineDistance(
        lat1,
        lon1,
        lat2,
        lon2
    ) {

        const R = 6371;

        const dLat =
            toRadians(lat2 - lat1);

        const dLon =
            toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) *
            Math.sin(dLat / 2) +

            Math.cos(
                toRadians(lat1)
            ) *

            Math.cos(
                toRadians(lat2)
            ) *

            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return R * c;
    }

    function toRadians(degrees) {
        return degrees *
            Math.PI /
            180;
    }

    /* ============================================================
       MAIN ROUTE CALCULATION
    ============================================================ */

    async function calculateRoute() {

        if (!currentMarker) {

            alert(
                "Please click 'Get Current Location' first."
            );

            return;
        }

        if (
            !destination ||
            destination.value.trim() === ""
        ) {

            alert(
                "Please enter a destination."
            );

            return;
        }

        if (calculateBtn) {

            calculateBtn.disabled = true;

            calculateBtn.textContent =
                "Optimizing Route...";
        }

        resultContainer.innerHTML =
            `
            <h3>⚓ Route Optimization</h3>
            <p>Searching for the safest and shortest route...</p>
            `;

        try {

            /* ====================================================
               START LOCATION
            ==================================================== */

            const start =
                currentMarker.getLatLng();

            /* ====================================================
               DESTINATION
            ==================================================== */

            const end =
                await geocodeDestination(
                    destination.value.trim()
                );

            /* ====================================================
               STRAIGHT DISTANCE
            ==================================================== */

            const straightDistance =
                haversineDistance(
                    start.lat,
                    start.lng,
                    end.lat,
                    end.lng
                );

            /* ====================================================
               GET OPTIMIZED ROUTE
            ==================================================== */

            const routeInfo =
                await optimizeRoute(
                    start,
                    end
                );

            let distanceKm =
                routeInfo.distanceKm;

            let travelHours =
                routeInfo.durationHours;

            let routeType =
                routeInfo.routeType;

            /* ====================================================
               FALLBACK
            ==================================================== */

            if (
                !distanceKm ||
                distanceKm <= 0
            ) {

                distanceKm =
                    straightDistance;

                routeType =
                    "Direct Sea Route";

                const type =
                    boatType?.value ||
                    "Small Boat";

                const speed =
                    SPEED_KMH[type] ||
                    SPEED_KMH["Small Boat"];

                travelHours =
                    distanceKm / speed;
            }

            /* ====================================================
               BOAT INFORMATION
            ==================================================== */

            const type =
                boatType?.value ||
                "Small Boat";

            const fuelRate =
                FUEL_RATE_PER_KM[type] ||
                FUEL_RATE_PER_KM["Small Boat"];

            const speed =
                SPEED_KMH[type] ||
                SPEED_KMH["Small Boat"];

            /* ====================================================
               FUEL CALCULATION
            ==================================================== */

            const fuelNeededLitres =
                distanceKm *
                fuelRate;

            const price =
                fuelPrice &&
                parseFloat(
                    fuelPrice.value
                ) > 0

                    ? parseFloat(
                        fuelPrice.value
                    )

                    : 0;

            const totalCost =
                fuelNeededLitres *
                price;

            /* ====================================================
               TRAVEL TIME FALLBACK
            ==================================================== */

            if (
                !travelHours ||
                travelHours <= 0
            ) {

                travelHours =
                    distanceKm / speed;
            }

            /* ====================================================
               SAFETY SCORE
            ==================================================== */

            const score =
                calculateSafetyScore();

            /* ====================================================
               DISPLAY NORMAL RESULTS
            ==================================================== */

            displayResults({

                distanceKm,

                fuelNeededLitres,

                totalCost,

                travelHours,

                score
            });

            /* ====================================================
               DISPLAY ROUTE OPTIMIZATION
            ==================================================== */

            displayRouteOptimization({

                routeType,

                straightDistance,

                optimizedDistance:
                    distanceKm,

                fuelNeeded:
                    fuelNeededLitres,

                travelHours,

                score,

                boatType:
                    type
            });

            /* ====================================================
               FUEL WARNING
            ==================================================== */

            checkFuelSufficiency(
                fuelNeededLitres
            );

            /* ====================================================
               SAVE TRIP
            ==================================================== */

            await saveTripToSupabase({

                destination:
                    destination.value.trim(),

                distanceKm,

                fuelNeededLitres,

                totalCost,

                travelHours,

                score,

                startLatitude:
                    start.lat,

                startLongitude:
                    start.lng,

                destinationLatitude:
                    end.lat,

                destinationLongitude:
                    end.lng
            });

            /* ====================================================
               LOAD HISTORY
            ==================================================== */

            await loadTripHistory();

        } catch (error) {

            console.error(
                "Route calculation error:",
                error
            );

            resultContainer.innerHTML =
                `
                <h3>⚠️ Route Calculation Error</h3>
                <p>${escapeHTML(
                    error.message ||
                    "Unable to calculate route."
                )}</p>
                `;

            alert(
                "Unable to calculate the route.\n\n" +
                (error.message ||
                    "Please check the destination and internet connection.")
            );

        } finally {

            if (calculateBtn) {

                calculateBtn.disabled =
                    false;

                calculateBtn.textContent =
                    "Calculate Route";
            }
        }
    }

    /* ============================================================
       ROUTE OPTIMIZATION
    ============================================================ */

    async function optimizeRoute(
        start,
        end
    ) {

        /* ========================================================
           REMOVE OLD ROUTES
        ======================================================== */

        if (routeLine) {

            map.removeLayer(
                routeLine
            );

            routeLine = null;
        }

        if (optimizedRouteLine) {

            map.removeLayer(
                optimizedRouteLine
            );

            optimizedRouteLine = null;
        }

        if (destinationMarker) {

            map.removeLayer(
                destinationMarker
            );

            destinationMarker = null;
        }

        /* ========================================================
           DESTINATION MARKER
        ======================================================== */

        destinationMarker =
            L.marker([
                end.lat,
                end.lng
            ])
            .addTo(map)
            .bindPopup(
                "<b>Destination</b><br>" +
                escapeHTML(
                    destination?.value ||
                    "Destination"
                )
            );

        /* ========================================================
           OSRM ROUTE
        ======================================================== */

        try {

            const url =
                `https://router.project-osrm.org/route/v1/driving/` +
                `${start.lng},${start.lat};` +
                `${end.lng},${end.lat}` +
                `?overview=full&geometries=geojson`;

            const response =
                await fetch(url);

            if (!response.ok) {
                throw new Error(
                    "OSRM unavailable"
                );
            }

            const data =
                await response.json();

            if (
                data.code === "Ok" &&
                data.routes &&
                data.routes.length > 0
            ) {

                const route =
                    data.routes[0];

                const coordinates =
                    route.geometry.coordinates.map(
                        function (coordinate) {

                            return [
                                coordinate[1],
                                coordinate[0]
                            ];
                        }
                    );

                optimizedRouteLine =
                    L.polyline(
                        coordinates,
                        {
                            weight: 6,
                            opacity: 0.9
                        }
                    ).addTo(map);

                map.fitBounds(
                    optimizedRouteLine.getBounds(),
                    {
                        padding: [
                            50,
                            50
                        ]
                    }
                );

                return {

                    distanceKm:
                        route.distance / 1000,

                    durationHours:
                        route.duration / 3600,

                    routeType:
                        "Optimized Route"
                };
            }

        } catch (error) {

            console.warn(
                "Road route unavailable. Using direct sea route.",
                error
            );
        }

        /* ========================================================
           DIRECT SEA ROUTE FALLBACK
        ======================================================== */

        const directCoordinates = [
            [
                start.lat,
                start.lng
            ],

            [
                end.lat,
                end.lng
            ]
        ];

        routeLine =
            L.polyline(
                directCoordinates,
                {
                    weight: 6,
                    opacity: 0.9,
                    dashArray: "10,10"
                }
            ).addTo(map);

        map.fitBounds(
            routeLine.getBounds(),
            {
                padding: [
                    50,
                    50
                ]
            }
        );

        const distanceKm =
            haversineDistance(
                start.lat,
                start.lng,
                end.lat,
                end.lng
            );

        const type =
            boatType?.value ||
            "Small Boat";

        const speed =
            SPEED_KMH[type] ||
            SPEED_KMH["Small Boat"];

        return {

            distanceKm,

            durationHours:
                distanceKm / speed,

            routeType:
                "Direct Sea Route"
        };
    }

    /* ============================================================
       SAFETY SCORE
    ============================================================ */

    function calculateSafetyScore() {

        let score = 100;

        const seaState =
            sea?.textContent?.trim() ||
            "Unknown";

        const windText =
            wind?.textContent ||
            "";

        const windValue =
            parseFloat(
                windText
            ) || 0;

        /* ========================================================
           SEA CONDITION
        ======================================================== */

        if (seaState === "Rough") {

            score -= 50;

        } else if (
            seaState === "Moderate"
        ) {

            score -= 25;
        }

        /* ========================================================
           WIND
        ======================================================== */

        if (windValue > 40) {

            score -= 30;

        } else if (windValue > 30) {

            score -= 20;

        } else if (windValue > 20) {

            score -= 10;
        }

        /* ========================================================
           LIMIT SCORE
        ======================================================== */

        score =
            Math.max(
                0,
                Math.min(
                    100,
                    score
                )
            );

        return score;
    }

    /* ============================================================
       DISPLAY CALCULATED RESULTS
    ============================================================ */

    function displayResults({
        distanceKm,
        fuelNeededLitres,
        totalCost,
        travelHours,
        score
    }) {

        if (distance) {

            distance.textContent =
                distanceKm.toFixed(2) +
                " km";
        }

        if (fuelNeed) {

            fuelNeed.textContent =
                fuelNeededLitres.toFixed(2) +
                " L";
        }

        if (fuelCost) {

            fuelCost.textContent =
                "₹" +
                totalCost.toFixed(2);
        }

        if (travelTime) {

            let hours =
                Math.floor(
                    travelHours
                );

            let minutes =
                Math.round(
                    (
                        travelHours -
                        hours
                    ) * 60
                );

            if (minutes === 60) {

                hours++;
                minutes = 0;
            }

            travelTime.textContent =
                hours +
                "h " +
                minutes +
                "m";
        }

        if (safetyScore) {

            safetyScore.textContent =
                score +
                " / 100";

            if (score >= 80) {

                safetyScore.style.color =
                    "green";

            } else if (score >= 50) {

                safetyScore.style.color =
                    "orange";

            } else {

                safetyScore.style.color =
                    "red";
            }
        }
    }

    /* ============================================================
       ROUTE OPTIMIZATION RESULT
    ============================================================ */

    function displayRouteOptimization({
        routeType,
        straightDistance,
        optimizedDistance,
        fuelNeeded,
        travelHours,
        score,
        boatType
    }) {

        const distanceSaved =
            Math.max(
                0,
                straightDistance -
                optimizedDistance
            );

        const fuelPriceValue =
            fuelPrice &&
            parseFloat(
                fuelPrice.value
            ) > 0

                ? parseFloat(
                    fuelPrice.value
                )

                : 0;

        const estimatedCost =
            fuelNeeded *
            fuelPriceValue;

        let safetyText =
            "Safe";

        if (score < 50) {

            safetyText =
                "Dangerous";

        } else if (score < 80) {

            safetyText =
                "Moderate Risk";
        }

        let hours =
            Math.floor(
                travelHours
            );

        let minutes =
            Math.round(
                (
                    travelHours -
                    hours
                ) * 60
            );

        if (minutes === 60) {

            hours++;
            minutes = 0;
        }

        resultContainer.innerHTML =
            `
            <div style="
                border:1px solid rgba(0,220,255,0.5);
                border-radius:15px;
                padding:20px;
            ">

                <h2 style="
                    margin-top:0;
                    text-align:center;
                ">
                    ⚓ Route Optimization
                </h2>

                <p>
                    <strong>Route Type:</strong>
                    ${escapeHTML(routeType)}
                </p>

                <p>
                    <strong>Boat Type:</strong>
                    ${escapeHTML(boatType)}
                </p>

                <hr>

                <p>
                    📍 <strong>Direct Distance:</strong>
                    ${straightDistance.toFixed(2)} km
                </p>

                <p>
                    🧭 <strong>Optimized Distance:</strong>
                    ${optimizedDistance.toFixed(2)} km
                </p>

                <p>
                    📉 <strong>Distance Difference:</strong>
                    ${distanceSaved.toFixed(2)} km
                </p>

                <p>
                    ⛽ <strong>Fuel Required:</strong>
                    ${fuelNeeded.toFixed(2)} L
                </p>

                <p>
                    💰 <strong>Estimated Fuel Cost:</strong>
                    ₹${estimatedCost.toFixed(2)}
                </p>

                <p>
                    ⏱️ <strong>Estimated Travel Time:</strong>
                    ${hours}h ${minutes}m
                </p>

                <p>
                    🌊 <strong>Sea Condition:</strong>
                    ${escapeHTML(
                        sea?.textContent ||
                        "Unknown"
                    )}
                </p>

                <p>
                    💨 <strong>Wind Speed:</strong>
                    ${escapeHTML(
                        wind?.textContent ||
                        "Unknown"
                    )}
                </p>

                <p>
                    🛡️ <strong>Safety Score:</strong>
                    ${score} / 100
                </p>

                <p>
                    🚦 <strong>Safety Status:</strong>
                    ${safetyText}
                </p>

                <hr>

                <div style="
                    text-align:center;
                    padding:12px;
                    border-radius:10px;
                    background:rgba(0,150,255,0.15);
                ">
                    <strong>
                        ${routeType === "Optimized Route"
                            ? "✓ Optimized route calculated successfully"
                            : "✓ Direct sea route calculated successfully"}
                    </strong>
                </div>

            </div>
            `;
    }

    /* ============================================================
       FUEL SUFFICIENCY
    ============================================================ */

    function checkFuelSufficiency(
        fuelNeededLitres
    ) {

        if (!fuelAvailable) {
            return;
        }

        const available =
            parseFloat(
                fuelAvailable.value
            );

        if (
            !isNaN(available) &&
            available < fuelNeededLitres
        ) {

            alert(
                `Warning: You have ${available}L available, ` +
                `but this trip needs approximately ` +
                `${fuelNeededLitres.toFixed(2)}L.` +
                `\n\nConsider refuelling before departure.`
            );
        }
    }

    /* ============================================================
       SAVE TRIP TO SUPABASE
       IMPORTANT: NO .select().single()
    ============================================================ */

    async function saveTripToSupabase(
        trip
    ) {

        try {

            const userId =
                currentUser.id ||
                localStorage.getItem(
                    "user_id"
                ) ||
                null;

            const userName =
                currentUser.name ||
                localStorage.getItem(
                    "user_name"
                ) ||
                "";

            const phone =
                currentUser.phone ||
                localStorage.getItem(
                    "user_phone"
                ) ||
                "";

            const { error } =
                await supabase
                    .from("trip_history")
                    .insert([
                        {

                            user_id:
                                userId,

                            user_name:
                                userName,

                            phone:
                                phone,

                            destination:
                                trip.destination,

                            distance_km:
                                trip.distanceKm,

                            fuel_needed_litres:
                                trip.fuelNeededLitres,

                            total_cost:
                                trip.totalCost,

                            travel_hours:
                                trip.travelHours,

                            safety_score:
                                trip.score,

                            start_latitude:
                                trip.startLatitude,

                            start_longitude:
                                trip.startLongitude,

                            destination_latitude:
                                trip.destinationLatitude,

                            destination_longitude:
                                trip.destinationLongitude
                        }
                    ]);

            if (error) {
                throw error;
            }

            console.log(
                "Trip successfully saved to Supabase."
            );

        } catch (error) {

            console.error(
                "Supabase trip save error:",
                error
            );

            /*
                Do not stop route calculation
                when history saving fails.
            */
        }
    }

    /* ============================================================
       LOAD TRIP HISTORY
    ============================================================ */

    async function loadTripHistory() {

        if (!tripHistory) {
            return;
        }

        try {

            const userId =
                currentUser.id ||
                localStorage.getItem(
                    "user_id"
                );

            if (!userId) {

                tripHistory.innerHTML =
                    "<p style='text-align:center;'>No trips yet</p>";

                return;
            }

            const {
                data: trips,
                error
            } =
                await supabase
                    .from("trip_history")
                    .select("*")
                    .eq(
                        "user_id",
                        userId
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    )
                    .limit(20);

            if (error) {
                throw error;
            }

            if (
                !trips ||
                trips.length === 0
            ) {

                tripHistory.innerHTML =
                    "<p style='text-align:center;'>No trips yet</p>";

                return;
            }

            tripHistory.innerHTML = "";

            trips.forEach(
                function (trip) {

                    const item =
                        document.createElement(
                            "div"
                        );

                    item.className =
                        "trip-item";

                    item.style.padding =
                        "12px";

                    item.style.marginBottom =
                        "10px";

                    item.style.borderRadius =
                        "10px";

                    item.style.background =
                        "rgba(0,100,180,0.15)";

                    const date =
                        trip.created_at
                            ? new Date(
                                trip.created_at
                            ).toLocaleString()
                            : "Recently";

                    item.innerHTML =
                        `
                        <div>
                            <h4>
                                ${escapeHTML(
                                    trip.destination ||
                                    "Unknown"
                                )}
                            </h4>

                            <small>
                                Distance:
                                ${Number(
                                    trip.distance_km ||
                                    0
                                ).toFixed(1)}
                                km
                                &nbsp; | &nbsp;
                                Fuel:
                                ${Number(
                                    trip.fuel_needed_litres ||
                                    0
                                ).toFixed(1)}
                                L
                                &nbsp; | &nbsp;
                                Cost:
                                ₹${Number(
                                    trip.total_cost ||
                                    0
                                ).toFixed(2)}
                            </small>

                            <br>

                            <small>
                                Safety:
                                ${Number(
                                    trip.safety_score ||
                                    0
                                )}/100
                                &nbsp; | &nbsp;
                                ${escapeHTML(
                                    date
                                )}
                            </small>
                        </div>
                        `;

                    tripHistory.appendChild(
                        item
                    );
                }
            );

        } catch (error) {

            console.error(
                "Supabase trip history error:",
                error
            );

            tripHistory.innerHTML =
                "<p style='text-align:center;'>Unable to load trip history</p>";
        }
    }

    /* ============================================================
       ESCAPE HTML
    ============================================================ */

    function escapeHTML(value) {

        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );
    }

    /* ============================================================
       RESTORE LAST TRIP SETUP
    ============================================================ */

    function restoreLastTripSetup() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        "lastTripSetup"
                    ) || "null"
                );

            if (!saved) {
                return;
            }

            if (
                destination &&
                saved.destination
            ) {
                destination.value =
                    saved.destination;
            }

            if (
                boatType &&
                saved.boatType
            ) {
                boatType.value =
                    saved.boatType;
            }

            if (
                fuelAvailable &&
                saved.fuelAvailable
            ) {
                fuelAvailable.value =
                    saved.fuelAvailable;
            }

            if (
                fuelPrice &&
                saved.fuelPrice
            ) {
                fuelPrice.value =
                    saved.fuelPrice;
            }

        } catch (error) {

            console.warn(
                "Unable to restore trip setup:",
                error
            );
        }
    }

    /* ============================================================
       SAVE TRIP SETUP
    ============================================================ */

    function saveTripSetup() {

        try {

            localStorage.setItem(
                "lastTripSetup",

                JSON.stringify({

                    destination:
                        destination?.value ||
                        "",

                    boatType:
                        boatType?.value ||
                        "",

                    fuelAvailable:
                        fuelAvailable?.value ||
                        "",

                    fuelPrice:
                        fuelPrice?.value ||
                        ""
                })
            );

        } catch (error) {

            console.warn(
                "Unable to save trip setup:",
                error
            );
        }
    }

    [
        destination,
        boatType,
        fuelAvailable,
        fuelPrice
    ].forEach(
        function (element) {

            if (element) {

                element.addEventListener(
                    "change",
                    saveTripSetup
                );
            }
        }
    );

    /* ============================================================
       INITIALIZATION
    ============================================================ */

    restoreLastTripSetup();

    getCurrentLocation();

    loadTripHistory();

});