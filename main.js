import { supabase } from "./supabase-config.js";

const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
);

const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

// ---------------------------
// DOM ELEMENTS
// ---------------------------

const welcome = document.getElementById("welcome");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const smsLink = document.getElementById("smsLink");
const hazardLink = document.getElementById("hazardLink");
const fuelLink = document.getElementById("fuelLink");


// ---------------------------
// LOGIN BUTTON
// ---------------------------

if (loginBtn) {

    loginBtn.onclick = function () {

        window.location.href = "index.html";

    };

}


// ---------------------------
// REGISTRATION CHECK
// ---------------------------

async function checkRegistration() {

    if (!currentUser || !currentUser.phone) {

        lockModules();

        return;

    }

    try {

        const { data: registeredUsers, error } =
            await supabase
                .from("registered_users")
                .select("id")
                .eq("phone", currentUser.phone)
                .limit(1);

        if (error) {
            throw error;
        }

        if (
            registeredUsers &&
            registeredUsers.length > 0
        ) {

            localStorage.setItem(
                "isRegistered",
                "true"
            );

            unlockModules();

        }

        else {

            localStorage.setItem(
                "isRegistered",
                "false"
            );

            lockModules();

        }

    }

    catch (error) {

        console.error(
            "Registration Check Error:",
            error
        );

        localStorage.setItem(
            "isRegistered",
            "false"
        );

        lockModules();

    }

}


// ---------------------------
// ASK REGISTRATION
// ---------------------------

function askRegistration(page) {

    const isRegistered =
        localStorage.getItem("isRegistered") === "true";

    if (isRegistered) {

        window.location.href = page;

        return;

    }

    const register = confirm(
        "You are not registered as a fisherman.\n\n" +
        "Click OK to Register Now."
    );

    if (register) {

        window.location.href = "register.html";

    }

}


// ---------------------------
// LOCK MODULES
// ---------------------------

function lockModules() {

    if (!smsLink || !hazardLink || !fuelLink) {
        return;
    }

    smsLink.classList.add("locked");
    hazardLink.classList.add("locked");
    fuelLink.classList.add("locked");

    smsLink.innerHTML =
        "🔒 SMS Safety";

    hazardLink.innerHTML =
        "🔒 Hazard Detection";

    fuelLink.innerHTML =
        "🔒 Fuel Route Optimizer";


    smsLink.onclick = function (e) {

        e.preventDefault();

        askRegistration("safety.html");

    };


    hazardLink.onclick = function (e) {

        e.preventDefault();

        askRegistration("hazard.html");

    };


    fuelLink.onclick = function (e) {

        e.preventDefault();

        askRegistration("fuel.html");

    };

}


// ---------------------------
// UNLOCK MODULES
// ---------------------------

function unlockModules() {

    if (!smsLink || !hazardLink || !fuelLink) {
        return;
    }

    smsLink.classList.remove("locked");
    hazardLink.classList.remove("locked");
    fuelLink.classList.remove("locked");

    smsLink.innerHTML =
        "SMS Safety";

    hazardLink.innerHTML =
        "Hazard Detection";

    fuelLink.innerHTML =
        "Fuel Route Optimizer";


    smsLink.onclick = function (e) {

        e.preventDefault();

        window.location.href =
            "safety.html";

    };


    hazardLink.onclick = function (e) {

        e.preventDefault();

        window.location.href =
            "hazard.html";

    };


    fuelLink.onclick = function (e) {

        e.preventDefault();

        window.location.href =
            "fuel.html";

    };

}


// ---------------------------
// INITIAL PAGE LOAD
// ---------------------------

if (isLoggedIn && currentUser) {

    if (welcome) {

        welcome.innerHTML =
            "Welcome " + currentUser.name;

    }


    if (loginBtn) {

        loginBtn.style.display =
            "none";

    }


    if (logoutBtn) {

        logoutBtn.style.display =
            "inline-block";

    }

    checkRegistration();

}

else {

    if (welcome) {

        welcome.innerHTML =
            "Welcome";

    }


    if (loginBtn) {

        loginBtn.style.display =
            "inline-block";

    }


    if (logoutBtn) {

        logoutBtn.style.display =
            "none";

    }

    lockModules();

}


// ---------------------------
// LOGOUT
// ---------------------------

if (logoutBtn) {

    logoutBtn.onclick = async function () {

        try {

            await supabase.auth.signOut();

        }

        catch (error) {

            console.error(
                "Supabase Logout Error:",
                error
            );

        }


        localStorage.removeItem(
            "currentUser"
        );

        localStorage.removeItem(
            "user_id"
        );

        localStorage.removeItem(
            "user_name"
        );

        localStorage.removeItem(
            "user_phone"
        );

        localStorage.removeItem(
            "isLoggedIn"
        );

        localStorage.removeItem(
            "isRegistered"
        );


        window.location.href =
            "index.html";

    };

}


// ---------------------------
// WEATHER
// ---------------------------

async function loadWeather() {

    try {

        const API_KEY =
            "00635e07f8b20b8f0d5335fc43245700";


        let weatherURL;


        // Use saved GPS location when available
        if (
            currentUser &&
            currentUser.latitude &&
            currentUser.longitude
        ) {

            weatherURL =
                `https://api.openweathermap.org/data/2.5/weather?lat=${currentUser.latitude}&lon=${currentUser.longitude}&appid=${API_KEY}&units=metric`;

        }

        else {

            // Fallback location
            weatherURL =
                `https://api.openweathermap.org/data/2.5/weather?q=pulivendula&appid=${API_KEY}&units=metric`;

        }


        const response =
            await fetch(weatherURL);


        if (!response.ok) {

            throw new Error(
                "Weather API failed"
            );

        }


        const data =
            await response.json();


        const location =
            document.getElementById(
                "location"
            );

        const temp =
            document.getElementById(
                "temp"
            );

        const weather =
            document.getElementById(
                "weather"
            );

        const wind =
            document.getElementById(
                "wind"
            );

        const status =
            document.getElementById(
                "status"
            );


        if (location) {

            location.innerHTML =
                data.name || "Unknown Location";

        }


        if (temp) {

            temp.innerHTML =
                data.main.temp + " °C";

        }


        if (weather) {

            weather.innerHTML =
                data.weather[0].description;

        }


        if (wind) {

            // OpenWeather gives wind speed in m/s
            // Convert to km/h
            const windSpeed =
                (data.wind.speed * 3.6).toFixed(1);

            wind.innerHTML =
                windSpeed + " km/h";

        }


        if (status) {

            const windSpeedKmh =
                data.wind.speed * 3.6;


            if (windSpeedKmh > 15) {

                status.innerHTML =
                    "UNSAFE";

                status.style.color =
                    "red";

            }

            else {

                status.innerHTML =
                    "SAFE";

                status.style.color =
                    "lightgreen";

            }

        }

    }

    catch (error) {

        console.error(
            "Weather Error:",
            error
        );


        const location =
            document.getElementById(
                "location"
            );

        const temp =
            document.getElementById(
                "temp"
            );

        const weather =
            document.getElementById(
                "weather"
            );

        const wind =
            document.getElementById(
                "wind"
            );

        const status =
            document.getElementById(
                "status"
            );


        if (location) {

            location.innerHTML =
                "Weather Failed";

        }


        if (temp) {

            temp.innerHTML =
                "--";

        }


        if (weather) {

            weather.innerHTML =
                "--";

        }


        if (wind) {

            wind.innerHTML =
                "--";

        }


        if (status) {

            status.innerHTML =
                "--";

        }

    }

}


loadWeather();


// ---------------------------
// EMERGENCY STATUS
// ---------------------------

async function loadEmergencyStatus() {

    const statusText =
        document.getElementById(
            "statusText"
        );


    if (!statusText) {

        return;

    }


    if (
        !currentUser ||
        !currentUser.phone
    ) {

        statusText.innerHTML =
            "No Emergency";

        return;

    }


    try {

        const {
            data: emergencyAlerts,
            error
        } = await supabase
            .from("emergency_alerts")
            .select("*")
            .eq("phone", currentUser.phone)
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(1);


        if (error) {

            throw error;

        }


        if (
            !emergencyAlerts ||
            emergencyAlerts.length === 0
        ) {

            statusText.innerHTML =
                "No Emergency";

            return;

        }


        const latestAlert =
            emergencyAlerts[0];


        statusText.innerHTML =
            latestAlert.status ||
            "Emergency Requested";

    }

    catch (error) {

        console.error(
            "Emergency Status Error:",
            error
        );

        statusText.innerHTML =
            "No Emergency";

    }

}


loadEmergencyStatus();


// ---------------------------
// MOBILE MENU
// ---------------------------

const menuIcon =
    document.getElementById(
        "menuIcon"
    );

const navLinks =
    document.getElementById(
        "navLinks"
    );


if (menuIcon && navLinks) {

    menuIcon.addEventListener(
        "click",
        function () {

            navLinks.classList.toggle(
                "active"
            );

        }
    );

}