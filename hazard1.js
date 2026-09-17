// ---------------------------------------------------------------
// SUPABASE
// ---------------------------------------------------------------
import { supabase } from "./supabase-config.js";


// ---------------------------------------------------------------
// AUTH CHECK
// ---------------------------------------------------------------
if (localStorage.getItem("isLoggedIn") !== "true") {
    alert("Please Login First");
    window.location.href = "index.html";
    throw new Error("Redirecting to login");
}

if (localStorage.getItem("isRegistered") !== "true") {

    const register = confirm(
        "You are not registered as a fisherman.\n\n" +
        "Click OK to Register Now."
    );

    if (register) {
        window.location.href = "register.html";
    } else {
        window.location.href = "main.html";
    }

    throw new Error(
        "Redirecting after registration prompt"
    );
}


// ---------------------------------------------------------------
// NAV MENU
// ---------------------------------------------------------------
const menuIcon =
    document.getElementById("menuIcon");

const navLinks =
    document.getElementById("navLinks");

if (menuIcon && navLinks) {

    menuIcon.onclick = function () {

        navLinks.classList.toggle(
            "active"
        );

    };
}


// ---------------------------------------------------------------
// DOM ELEMENTS
// ---------------------------------------------------------------
const locationInput =
    document.getElementById("location");

const hazardType =
    document.getElementById("hazardType");

const description =
    document.getElementById("description");

const submitBtn =
    document.getElementById("submitBtn");

const locationBtn =
    document.getElementById("locationBtn");

const hazardList =
    document.getElementById("hazardList");

const mapContainer =
    document.getElementById("map");


if (!mapContainer) {

    console.error(
        'No element with id="map" found in the HTML. ' +
        'The Leaflet map cannot initialize without it.'
    );

    throw new Error(
        "Map container not found"
    );
}


// ---------------------------------------------------------------
// CURRENT USER
// ---------------------------------------------------------------
let currentUser = null;

try {

    currentUser =
        JSON.parse(
            localStorage.getItem(
                "currentUser"
            ) || "null"
        );

} catch (error) {

    console.error(
        "Unable to read current user:",
        error
    );

}


// ---------------------------------------------------------------
// MAP INITIALIZATION
// ---------------------------------------------------------------
let selectedLat = 13.0827;
let selectedLng = 80.2707;


const map =
    L.map("map").setView(
        [
            selectedLat,
            selectedLng
        ],
        11
    );


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


const markers = [];


const userMarker =
    L.marker(
        [
            selectedLat,
            selectedLng
        ]
    )
    .addTo(map)
    .bindPopup(
        "Selected Location"
    )
    .openPopup();


// ---------------------------------------------------------------
// FIX MAP SIZE
// ---------------------------------------------------------------
requestAnimationFrame(
    function () {

        map.invalidateSize();

    }
);


window.addEventListener(
    "load",
    function () {

        setTimeout(
            function () {

                map.invalidateSize();

            },
            300
        );

    }
);


// ---------------------------------------------------------------
// LOCATION HANDLING
// ---------------------------------------------------------------
async function updateLocation(
    lat,
    lng
) {

    selectedLat = lat;
    selectedLng = lng;


    userMarker.setLatLng(
        [
            lat,
            lng
        ]
    );


    try {

        const response =
            await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );


        if (!response.ok) {

            throw new Error(
                "Location lookup failed"
            );

        }


        const data =
            await response.json();


        const address =
            data.address || {};


        if (locationInput) {

            locationInput.value =

                address.village ||

                address.town ||

                address.city ||

                address.county ||

                address.state ||

                data.display_name ||

                `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        }

    } catch (error) {

        console.error(
            "Reverse geocoding error:",
            error
        );


        if (locationInput) {

            locationInput.value =
                lat.toFixed(6) +
                ", " +
                lng.toFixed(6);

        }

    }
}


// ---------------------------------------------------------------
// MAP CLICK
// ---------------------------------------------------------------
map.on(
    "click",
    function (e) {

        updateLocation(
            e.latlng.lat,
            e.latlng.lng
        );

    }
);


// ---------------------------------------------------------------
// CURRENT LOCATION BUTTON
// ---------------------------------------------------------------
if (locationBtn) {

    locationBtn.onclick =
        function () {

            if (!navigator.geolocation) {

                alert(
                    "Geolocation not supported"
                );

                return;
            }


            locationBtn.disabled =
                true;

            locationBtn.textContent =
                "Getting Location...";


            navigator.geolocation.getCurrentPosition(

                function (position) {

                    const lat =
                        position.coords.latitude;

                    const lng =
                        position.coords.longitude;


                    map.setView(
                        [
                            lat,
                            lng
                        ],
                        13
                    );


                    updateLocation(
                        lat,
                        lng
                    );


                    locationBtn.disabled =
                        false;

                    locationBtn.textContent =
                        "Use My Location";

                },


                function (error) {

                    console.error(
                        "Geolocation error:",
                        error
                    );


                    alert(
                        "Unable to fetch your location. " +
                        "Please allow location access."
                    );


                    locationBtn.disabled =
                        false;

                    locationBtn.textContent =
                        "Use My Location";

                },

                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }

            );

        };
}


// ---------------------------------------------------------------
// AUTOMATIC CURRENT LOCATION
// ---------------------------------------------------------------
if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const lat =
                position.coords.latitude;

            const lng =
                position.coords.longitude;


            map.setView(
                [
                    lat,
                    lng
                ],
                13
            );


            updateLocation(
                lat,
                lng
            );

        },

        function (error) {

            console.warn(
                "Automatic location unavailable:",
                error
            );

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );

}


// ---------------------------------------------------------------
// HAZARD MARKER COLOR
// ---------------------------------------------------------------
function markerColor(type) {

    switch (type) {

        case "Hidden Rock":
            return "red";

        case "Rogue Nets":
            return "orange";

        case "High Waves":
            return "yellow";

        case "Strong Current":
            return "blue";

        default:
            return "green";
    }
}


// ---------------------------------------------------------------
// HAZARD ICON
// ---------------------------------------------------------------
function markerIcon(type) {

    switch (type) {

        case "Hidden Rock":
            return "⛔";

        case "Rogue Nets":
            return "🪝";

        case "High Waves":
            return "🌊";

        case "Strong Current":
            return "🌀";

        default:
            return "✅";
    }
}


// ---------------------------------------------------------------
// ESCAPE HTML
// ---------------------------------------------------------------
function escapeHTML(value) {

    return String(value ?? "")

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


// ---------------------------------------------------------------
// LOAD HAZARDS FROM SUPABASE
// ---------------------------------------------------------------
async function loadHazards() {

    if (!hazardList) {
        return;
    }


    // Remove old markers
    markers.forEach(
        function (marker) {

            map.removeLayer(
                marker
            );

        }
    );


    markers.length = 0;


    hazardList.innerHTML = "";


    try {

        const {
            data: hazards,
            error
        } = await supabase

            .from("hazards")

            .select("*")

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            throw error;

        }


        if (
            !hazards ||
            hazards.length === 0
        ) {

            hazardList.innerHTML =
                "<p style='text-align:center;'>" +
                "No Hazards Reported" +
                "</p>";

            return;
        }


        hazards.forEach(
            function (hazard) {

                const latitude =
                    Number(
                        hazard.latitude
                    );

                const longitude =
                    Number(
                        hazard.longitude
                    );


                // ------------------------------------------------
                // MARKER
                // ------------------------------------------------
                if (
                    Number.isFinite(latitude) &&
                    Number.isFinite(longitude)
                ) {

                    const marker =
                        L.marker(
                            [
                                latitude,
                                longitude
                            ]
                        )
                        .addTo(map);


                    marker.bindPopup(

                        "<b>" +
                        escapeHTML(
                            hazard.type ||
                            "Hazard"
                        ) +
                        "</b><br>" +

                        escapeHTML(
                            hazard.description ||
                            ""
                        ) +

                        "<br><br>" +

                        escapeHTML(
                            hazard.location ||
                            ""
                        )

                    );


                    markers.push(
                        marker
                    );

                }


                // ------------------------------------------------
                // DATE
                // ------------------------------------------------
                let displayDate =
                    "Recently";


                if (hazard.created_at) {

                    const date =
                        new Date(
                            hazard.created_at
                        );


                    if (
                        !isNaN(
                            date.getTime()
                        )
                    ) {

                        displayDate =
                            date.toLocaleDateString();

                    }

                } else if (
                    hazard.date
                ) {

                    displayDate =
                        hazard.date;

                }


                // ------------------------------------------------
                // TIME
                // ------------------------------------------------
                let displayTime =
                    "";


                if (hazard.created_at) {

                    const date =
                        new Date(
                            hazard.created_at
                        );


                    if (
                        !isNaN(
                            date.getTime()
                        )
                    ) {

                        displayTime =
                            date.toLocaleTimeString();

                    }

                } else if (
                    hazard.time
                ) {

                    displayTime =
                        hazard.time;

                }


                // ------------------------------------------------
                // HAZARD LIST
                // ------------------------------------------------
                hazardList.innerHTML += `

                    <div class="hazard-item">

                        <div>

                            <h3>
                                ${escapeHTML(
                                    hazard.type ||
                                    "Unknown Hazard"
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    hazard.description ||
                                    "No description"
                                )}
                            </p>

                            <small>
                                ${escapeHTML(
                                    hazard.location ||
                                    "Unknown location"
                                )}
                            </small>

                        </div>

                        <span class="time">

                            ${escapeHTML(
                                displayDate
                            )}

                            <br>

                            ${escapeHTML(
                                displayTime
                            )}

                        </span>

                    </div>

                `;

            }
        );

    } catch (error) {

        console.error(
            "Supabase hazard loading error:",
            error
        );


        hazardList.innerHTML =

            "<p style='color:red;text-align:center;'>" +

            "Unable to Load Hazards" +

            "</p>";

    }
}


// ---------------------------------------------------------------
// SUBMIT HAZARD TO SUPABASE
// ---------------------------------------------------------------
if (submitBtn) {

    submitBtn.onclick =
        async function () {

            if (
                !description ||
                description.value.trim() === ""
            ) {

                alert(
                    "Please Enter Hazard Description"
                );

                return;
            }


            if (
                !locationInput ||
                locationInput.value.trim() === ""
            ) {

                alert(
                    "Please Select Location"
                );

                return;
            }


            if (
                !Number.isFinite(
                    selectedLat
                ) ||
                !Number.isFinite(
                    selectedLng
                )
            ) {

                alert(
                    "Please select a valid location on the map."
                );

                return;
            }


            submitBtn.disabled =
                true;

            submitBtn.textContent =
                "Submitting...";


            try {

                const now =
                    new Date();


                const userId =
                    currentUser?.id ||
                    localStorage.getItem(
                        "user_id"
                    ) ||
                    null;


                const userName =
                    currentUser?.name ||
                    localStorage.getItem(
                        "user_name"
                    ) ||
                    "";


                const phone =
                    currentUser?.phone ||
                    localStorage.getItem(
                        "user_phone"
                    ) ||
                    "";


                const hazardData = {

                    type:
                        hazardType
                            ? hazardType.value
                            : "Unknown",

                    description:
                        description.value.trim(),

                    location:
                        locationInput.value.trim(),

                    latitude:
                        selectedLat,

                    longitude:
                        selectedLng,

                    date:
                        now.toLocaleDateString(),

                    time:
                        now.toLocaleTimeString(),

                    user_id:
                        userId,

                    user_name:
                        userName,

                    phone:
                        phone,

                    created_at:
                        now.toISOString()

                };


                const {
                    data,
                    error
                } = await supabase

                    .from("hazards")

                    .insert([
                        hazardData
                    ])

                    .select()
                    .single();


                if (error) {

                    throw error;

                }


                console.log(
                    "Hazard saved to Supabase:",
                    data
                );


                description.value =
                    "";


                alert(
                    "Hazard Submitted Successfully"
                );


                await loadHazards();

            } catch (error) {

                console.error(
                    "Supabase hazard submission error:",
                    error
                );


                alert(
                    "Unable to Submit Hazard.\n\n" +
                    error.message
                );

            } finally {

                submitBtn.disabled =
                    false;

                submitBtn.textContent =
                    "Submit Hazard";

            }

        };

}


// ---------------------------------------------------------------
// INITIAL LOAD
// ---------------------------------------------------------------
loadHazards();


// ---------------------------------------------------------------
// AUTO REFRESH EVERY 30 SECONDS
// ---------------------------------------------------------------
setInterval(
    loadHazards,
    30000
);