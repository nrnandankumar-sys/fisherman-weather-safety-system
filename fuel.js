// ===============================================================
// SMART FUEL & ROUTE OPTIMIZER
// ===============================================================

// ===============================================================
// GLOBAL VARIABLES
// ===============================================================

let map = null;
let currentMarker = null;
let destinationMarker = null;
let routeLine = null;

let currentCoordinates = null;
let destinationCoordinates = null;


// ===============================================================
// BOAT FUEL CONSUMPTION
// Liters per kilometer
// ===============================================================

const boatFuelRate = {
    "Small Boat": 0.35,
    "Medium Boat": 0.50,
    "Large Boat": 0.75,
    "Trawler": 1.20
};


// ===============================================================
// DOM READY
// ===============================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Fuel & Route Optimizer Loaded");

    initializeMap();
    setupNavigation();
    setupButtons();
    loadTripHistory();

});


// ===============================================================
// INITIALIZE MAP
// ===============================================================

function initializeMap() {

    const mapElement =
        document.getElementById("map");

    if (!mapElement) {

        console.error("Map element not found");

        return;
    }


    map = L.map("map").setView(
        [20.5937, 78.9629],
        5
    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    console.log("Map initialized");

}


// ===============================================================
// NAVIGATION MENU
// ===============================================================

function setupNavigation() {

    const menuIcon =
        document.getElementById("menuIcon");

    const navLinks =
        document.getElementById("navLinks");


    if (
        menuIcon &&
        navLinks
    ) {

        menuIcon.addEventListener(
            "click",
            function () {

                navLinks.classList.toggle(
                    "active"
                );

            }
        );

    }

}


// ===============================================================
// BUTTON EVENTS
// ===============================================================

function setupButtons() {

    const locationBtn =
        document.getElementById("locationBtn");

    const optimizeBtn =
        document.getElementById("optimizeBtn");


    if (locationBtn) {

        locationBtn.addEventListener(
            "click",
            getCurrentLocation
        );

    }


    if (optimizeBtn) {

        optimizeBtn.addEventListener(
            "click",
            optimizeRoute
        );

    }

}


// ===============================================================
// GET CURRENT GPS LOCATION
// ===============================================================

function getCurrentLocation() {

    if (!navigator.geolocation) {

        alert(
            "Geolocation is not supported by your browser."
        );

        return;
    }


    const locationBtn =
        document.getElementById("locationBtn");


    if (locationBtn) {

        locationBtn.disabled = true;

        locationBtn.innerHTML =
            "Getting Location...";

    }


    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            currentCoordinates = {

                lat: latitude,

                lon: longitude

            };


            console.log(
                "Current Coordinates:",
                currentCoordinates
            );


            // ---------------------------------------------------
            // SHOW MAP
            // ---------------------------------------------------

            showCurrentMarker(
                latitude,
                longitude
            );


            // ---------------------------------------------------
            // GET LOCATION NAME
            // ---------------------------------------------------

            const locationName =
                await reverseGeocode(
                    latitude,
                    longitude
                );


            const currentInput =
                document.getElementById(
                    "currentLocation"
                );


            if (currentInput) {

                currentInput.value =
                    locationName;

            }


            // ---------------------------------------------------
            // GET WEATHER
            // ---------------------------------------------------

            await getWeather(
                latitude,
                longitude
            );


            if (locationBtn) {

                locationBtn.disabled =
                    false;

                locationBtn.innerHTML =
                    '<i class="fa-solid fa-location-crosshairs"></i> Current Location';

            }

        },

        function (error) {

            console.error(
                "GPS Error:",
                error
            );


            let message =
                "Unable to get your location.";


            if (error.code === 1) {

                message =
                    "Location permission was denied.";

            }

            else if (error.code === 2) {

                message =
                    "Location information is unavailable.";

            }

            else if (error.code === 3) {

                message =
                    "Location request timed out.";

            }


            alert(message);


            if (locationBtn) {

                locationBtn.disabled =
                    false;

                locationBtn.innerHTML =
                    '<i class="fa-solid fa-location-crosshairs"></i> Current Location';

            }

        },

        {
            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0

        }

    );

}


// ===============================================================
// SHOW CURRENT LOCATION MARKER
// ===============================================================

function showCurrentMarker(
    latitude,
    longitude
) {

    if (!map) {
        return;
    }


    if (currentMarker) {

        map.removeLayer(
            currentMarker
        );

    }


    currentMarker =
        L.marker(
            [
                latitude,
                longitude
            ]
        )
        .addTo(map)
        .bindPopup(
            "<b>Current Location</b>"
        );


    currentMarker.openPopup();


    map.setView(
        [
            latitude,
            longitude
        ],
        10
    );

}


// ===============================================================
// REVERSE GEOCODING
// ===============================================================

async function reverseGeocode(
    latitude,
    longitude
) {

    try {

        const url =
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;


        const response =
            await fetch(url, {
                headers: {
                    "Accept":
                        "application/json"
                }
            });


        if (!response.ok) {

            throw new Error(
                "Reverse geocoding failed"
            );

        }


        const data =
            await response.json();


        const address =
            data.address || {};


        return (

            address.village ||

            address.town ||

            address.city ||

            address.municipality ||

            address.county ||

            address.state ||

            data.display_name ||

            "Current Location"

        );

    }

    catch (error) {

        console.error(
            "Reverse Geocoding Error:",
            error
        );


        return "Current Location";

    }

}


// ===============================================================
// DESTINATION GEOCODING
// ===============================================================

async function geocodeDestination(
    destination
) {

    try {

        const url =
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`;


        const response =
            await fetch(url, {
                headers: {
                    "Accept":
                        "application/json"
                }
            });


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

            lat:
                parseFloat(
                    data[0].lat
                ),

            lon:
                parseFloat(
                    data[0].lon
                ),

            name:
                data[0].display_name

        };

    }

    catch (error) {

        console.error(
            "Destination Geocoding Error:",
            error
        );


        throw error;

    }

}


// ===============================================================
// OPTIMIZE ROUTE
// ===============================================================

async function optimizeRoute() {

    const currentInput =
        document.getElementById(
            "currentLocation"
        );

    const destinationInput =
        document.getElementById(
            "destination"
        );

    const boatTypeInput =
        document.getElementById(
            "boatType"
        );

    const fuelAvailableInput =
        document.getElementById(
            "fuelAvailable"
        );

    const fuelPriceInput =
        document.getElementById(
            "fuelPrice"
        );

    const optimizeBtn =
        document.getElementById(
            "optimizeBtn"
        );


    const destination =
        destinationInput
            ? destinationInput.value.trim()
            : "";


    const boatType =
        boatTypeInput
            ? boatTypeInput.value
            : "Small Boat";


    const fuelAvailable =
        fuelAvailableInput
            ? parseFloat(
                fuelAvailableInput.value
            )
            : 0;


    const fuelPrice =
        fuelPriceInput
            ? parseFloat(
                fuelPriceInput.value
            )
            : 0;


    // -----------------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------------

    if (!currentCoordinates) {

        alert(
            "Please click 'Current Location' first."
        );

        return;
    }


    if (!destination) {

        alert(
            "Please enter a destination."
        );

        return;
    }


    if (
        isNaN(fuelAvailable) ||
        fuelAvailable <= 0
    ) {

        alert(
            "Please enter available fuel."
        );

        return;
    }


    if (
        isNaN(fuelPrice) ||
        fuelPrice <= 0
    ) {

        alert(
            "Please enter fuel price."
        );

        return;
    }


    // -----------------------------------------------------------
    // BUTTON LOADING
    // -----------------------------------------------------------

    if (optimizeBtn) {

        optimizeBtn.disabled = true;

        optimizeBtn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Optimizing...';

    }


    try {

        // -------------------------------------------------------
        // FIND DESTINATION
        // -------------------------------------------------------

        destinationCoordinates =
            await geocodeDestination(
                destination
            );


        console.log(
            "Destination:",
            destinationCoordinates
        );


        // -------------------------------------------------------
        // SHOW DESTINATION
        // -------------------------------------------------------

        showDestinationMarker(
            destinationCoordinates.lat,
            destinationCoordinates.lon,
            destinationCoordinates.name
        );


        // -------------------------------------------------------
        // GET ROUTE
        // -------------------------------------------------------

        const route =
            await getRoute(
                currentCoordinates,
                destinationCoordinates
            );


        if (!route) {

            throw new Error(
                "Unable to calculate route."
            );

        }


        // -------------------------------------------------------
        // CALCULATE FUEL
        // -------------------------------------------------------

        const distanceKm =
            route.distance / 1000;


        const fuelRate =
            boatFuelRate[boatType] ||
            0.50;


        const fuelRequired =
            distanceKm * fuelRate;


        const fuelCost =
            fuelRequired * fuelPrice;


        const travelTimeHours =
            route.duration / 3600;


        // -------------------------------------------------------
        // SAFETY SCORE
        // -------------------------------------------------------

        const safetyScore =
            calculateSafetyScore();


        // -------------------------------------------------------
        // DISPLAY RESULT
        // -------------------------------------------------------

        displayRouteResult({

            distance:
                distanceKm,

            fuelRequired:
                fuelRequired,

            fuelCost:
                fuelCost,

            travelTime:
                travelTimeHours,

            safetyScore:
                safetyScore,

            fuelAvailable:
                fuelAvailable,

            boatType:
                boatType

        });


        // -------------------------------------------------------
        // CHECK FUEL
        // -------------------------------------------------------

        if (
            fuelRequired >
            fuelAvailable
        ) {

            alert(
                "⚠️ INSUFFICIENT FUEL\n\n" +

                "Required: " +
                fuelRequired.toFixed(2) +
                " L\n" +

                "Available: " +
                fuelAvailable.toFixed(2) +
                " L\n\n" +

                "Please increase fuel before starting the trip."
            );

        }

        else {

            alert(
                "✅ Route Optimized Successfully\n\n" +

                "Distance: " +
                distanceKm.toFixed(2) +
                " km\n" +

                "Fuel Required: " +
                fuelRequired.toFixed(2) +
                " L\n" +

                "Fuel Cost: ₹" +
                fuelCost.toFixed(2)
            );

        }


        // -------------------------------------------------------
        // SAVE TRIP
        // -------------------------------------------------------

        saveTrip({

            destination:
                destination,

            distance:
                distanceKm,

            fuel:
                fuelRequired,

            cost:
                fuelCost,

            time:
                travelTimeHours,

            safety:
                safetyScore,

            boat:
                boatType

        });


        loadTripHistory();

    }

    catch (error) {

        console.error(
            "Route Optimization Error:",
            error
        );


        alert(
            "Unable to optimize route.\n\n" +
            (
                error.message ||
                "Please check your location and destination."
            )
        );

    }

    finally {

        if (optimizeBtn) {

            optimizeBtn.disabled =
                false;

            optimizeBtn.innerHTML =
                '<i class="fa-solid fa-route"></i> Optimize Route';

        }

    }

}


// ===============================================================
// GET ROUTE USING OSRM
// ===============================================================

async function getRoute(
    start,
    destination
) {

    const url =
        `https://router.project-osrm.org/route/v1/driving/` +

        `${start.lon},${start.lat};` +

        `${destination.lon},${destination.lat}` +

        `?overview=full&geometries=geojson`;


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Routing service unavailable."
        );

    }


    const data =
        await response.json();


    if (
        data.code !== "Ok" ||
        !data.routes ||
        data.routes.length === 0
    ) {

        throw new Error(
            "No route found."
        );

    }


    const route =
        data.routes[0];


    drawRoute(
        route.geometry
    );


    return route;

}


// ===============================================================
// DRAW ROUTE ON LEAFLET MAP
// ===============================================================

function drawRoute(
    geometry
) {

    if (!map) {
        return;
    }


    if (routeLine) {

        map.removeLayer(
            routeLine
        );

    }


    routeLine =
        L.geoJSON(
            geometry,
            {
                style: {
                    color: "#0b5ed7",
                    weight: 6,
                    opacity: 0.85
                }
            }
        ).addTo(map);


    map.fitBounds(
        routeLine.getBounds(),
        {
            padding: [
                30,
                30
            ]
        }
    );

}


// ===============================================================
// DESTINATION MARKER
// ===============================================================

function showDestinationMarker(
    latitude,
    longitude,
    name
) {

    if (!map) {
        return;
    }


    if (destinationMarker) {

        map.removeLayer(
            destinationMarker
        );

    }


    destinationMarker =
        L.marker(
            [
                latitude,
                longitude
            ]
        )
        .addTo(map)
        .bindPopup(
            "<b>Destination</b><br>" +
            escapeHTML(name)
        );


}


// ===============================================================
// DISPLAY ROUTE RESULT
// ===============================================================

function displayRouteResult(
    result
) {

    const distance =
        document.getElementById(
            "distance"
        );


    const fuelNeed =
        document.getElementById(
            "fuelNeed"
        );


    const fuelCost =
        document.getElementById(
            "fuelCost"
        );


    const travelTime =
        document.getElementById(
            "travelTime"
        );


    const safetyScore =
        document.getElementById(
            "safetyScore"
        );


    if (distance) {

        distance.textContent =
            result.distance.toFixed(2) +
            " km";

    }


    if (fuelNeed) {

        fuelNeed.textContent =
            result.fuelRequired.toFixed(2) +
            " L";

    }


    if (fuelCost) {

        fuelCost.textContent =
            "₹ " +
            result.fuelCost.toFixed(2);

    }


    if (travelTime) {

        travelTime.textContent =
            formatTravelTime(
                result.travelTime
            );

    }


    if (safetyScore) {

        safetyScore.textContent =
            result.safetyScore +
            " / 100";

        safetyScore.style.fontWeight =
            "bold";


        if (
            result.safetyScore >= 80
        ) {

            safetyScore.style.color =
                "#198754";

        }

        else if (
            result.safetyScore >= 60
        ) {

            safetyScore.style.color =
                "#f59f00";

        }

        else {

            safetyScore.style.color =
                "#dc3545";

        }

    }

}


// ===============================================================
// TRAVEL TIME FORMAT
// ===============================================================

function formatTravelTime(
    hours
) {

    const totalMinutes =
        Math.round(
            hours * 60
        );


    const h =
        Math.floor(
            totalMinutes / 60
        );


    const m =
        totalMinutes % 60;


    if (h > 0) {

        return (
            h +
            " hr " +
            m +
            " min"
        );

    }


    return (
        m +
        " min"
    );

}


// ===============================================================
// WEATHER
// ===============================================================

async function getWeather(
    latitude,
    longitude
) {

    try {

        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Weather API error"
            );

        }


        const data =
            await response.json();


        const temperature =
            data.current?.temperature_2m;


        const wind =
            data.current?.wind_speed_10m;


        const weatherCode =
            data.current?.weather_code;


        const temperatureElement =
            document.getElementById(
                "temperature"
            );


        const windElement =
            document.getElementById(
                "wind"
            );


        const weatherElement =
            document.getElementById(
                "weather"
            );


        const seaElement =
            document.getElementById(
                "sea"
            );


        if (temperatureElement) {

            temperatureElement.textContent =
                temperature !== undefined
                    ? temperature + " °C"
                    : "--";

        }


        if (windElement) {

            windElement.textContent =
                wind !== undefined
                    ? wind + " km/h"
                    : "--";

        }


        const weatherText =
            getWeatherDescription(
                weatherCode
            );


        if (weatherElement) {

            weatherElement.textContent =
                weatherText;

        }


        if (seaElement) {

            seaElement.textContent =
                getSeaCondition(
                    wind
                );

        }


        console.log(
            "Weather:",
            data
        );

    }

    catch (error) {

        console.error(
            "Weather Error:",
            error
        );


        const weatherElement =
            document.getElementById(
                "weather"
            );


        const seaElement =
            document.getElementById(
                "sea"
            );


        if (weatherElement) {

            weatherElement.textContent =
                "Unavailable";

        }


        if (seaElement) {

            seaElement.textContent =
                "Unknown";

        }

    }

}


// ===============================================================
// WEATHER DESCRIPTION
// ===============================================================

function getWeatherDescription(
    code
) {

    const weatherCodes = {

        0:
            "Clear Sky",

        1:
            "Mainly Clear",

        2:
            "Partly Cloudy",

        3:
            "Cloudy",

        45:
            "Fog",

        48:
            "Dense Fog",

        51:
            "Light Drizzle",

        53:
            "Drizzle",

        55:
            "Heavy Drizzle",

        61:
            "Light Rain",

        63:
            "Rain",

        65:
            "Heavy Rain",

        71:
            "Light Snow",

        73:
            "Snow",

        75:
            "Heavy Snow",

        80:
            "Rain Showers",

        81:
            "Rain Showers",

        82:
            "Heavy Rain Showers",

        95:
            "Thunderstorm",

        96:
            "Thunderstorm + Hail",

        99:
            "Severe Thunderstorm"

    };


    return (
        weatherCodes[code] ||
        "Unknown"
    );

}


// ===============================================================
// SEA CONDITION
// ===============================================================

function getSeaCondition(
    wind
) {

    if (
        wind === undefined ||
        wind === null
    ) {

        return "Unknown";

    }


    if (wind < 10) {

        return "Calm";

    }


    if (wind < 20) {

        return "Moderate";

    }


    if (wind < 30) {

        return "Rough";

    }


    return "Dangerous";

}


// ===============================================================
// SAFETY SCORE
// ===============================================================

function calculateSafetyScore() {

    const weatherElement =
        document.getElementById(
            "weather"
        );


    const seaElement =
        document.getElementById(
            "sea"
        );


    let score = 100;


    const weather =
        weatherElement
            ? weatherElement.textContent
            : "";


    const sea =
        seaElement
            ? seaElement.textContent
            : "";


    // -----------------------------------------------------------
    // WEATHER PENALTY
    // -----------------------------------------------------------

    if (
        weather.includes("Thunderstorm")
    ) {

        score -= 50;

    }

    else if (
        weather.includes("Heavy Rain")
    ) {

        score -= 30;

    }

    else if (
        weather.includes("Rain")
    ) {

        score -= 15;

    }

    else if (
        weather.includes("Fog")
    ) {

        score -= 20;

    }


    // -----------------------------------------------------------
    // SEA PENALTY
    // -----------------------------------------------------------

    if (
        sea === "Dangerous"
    ) {

        score -= 50;

    }

    else if (
        sea === "Rough"
    ) {

        score -= 30;

    }

    else if (
        sea === "Moderate"
    ) {

        score -= 15;

    }


    if (score < 0) {

        score = 0;

    }


    return score;

}


// ===============================================================
// SAVE TRIP HISTORY
// ===============================================================

function saveTrip(
    trip
) {

    try {

        let history =
            JSON.parse(
                localStorage.getItem(
                    "fuelTripHistory"
                ) ||
                "[]"
            );


        history.unshift({

            ...trip,

            date:
                new Date().toISOString()

        });


        history =
            history.slice(
                0,
                20
            );


        localStorage.setItem(
            "fuelTripHistory",
            JSON.stringify(history)
        );


    }

    catch (error) {

        console.error(
            "Trip History Error:",
            error
        );

    }

}


// ===============================================================
// LOAD TRIP HISTORY
// ===============================================================

function loadTripHistory() {

    const tripHistory =
        document.getElementById(
            "tripHistory"
        );


    if (!tripHistory) {
        return;
    }


    let history = [];


    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    "fuelTripHistory"
                ) ||
                "[]"
            );

    }

    catch (error) {

        history = [];

    }


    if (
        history.length === 0
    ) {

        tripHistory.innerHTML =
            `
            <li>
                No Trips Available
            </li>
            `;

        return;

    }


    tripHistory.innerHTML =
        "";


    history
        .slice(0, 20)
        .forEach(
            function (trip) {

                const li =
                    document.createElement(
                        "li"
                    );


                li.innerHTML =
                    `
                    <strong>
                        🛥️ ${escapeHTML(
                            trip.destination
                        )}
                    </strong>

                    <br>

                    📏 Distance:
                    ${Number(
                        trip.distance
                    ).toFixed(2)}
                    km

                    <br>

                    ⛽ Fuel:
                    ${Number(
                        trip.fuel
                    ).toFixed(2)}
                    L

                    <br>

                    💰 Cost:
                    ₹${Number(
                        trip.cost
                    ).toFixed(2)}

                    <br>

                    ⏱️ Time:
                    ${formatTravelTime(
                        Number(
                            trip.time
                        )
                    )}

                    <br>

                    🛡️ Safety:
                    ${trip.safety}/100

                    <br>

                    <small>
                        ${formatDate(
                            trip.date
                        )}
                    </small>
                    `;


                tripHistory.appendChild(
                    li
                );

            }
        );

}


// ===============================================================
// FORMAT DATE
// ===============================================================

function formatDate(
    value
) {

    if (!value) {

        return "Recently";

    }


    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleString();

}


// ===============================================================
// ESCAPE HTML
// ===============================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

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