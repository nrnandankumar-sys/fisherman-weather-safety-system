// ===============================================================
// SAFETY CHECK - SUPABASE
// ===============================================================

import { supabase } from "./supabase-config.js";


// ===============================================================
// PAGE LOAD
// ===============================================================

document.addEventListener("DOMContentLoaded", async function () {

    console.log("Safety page loaded");


    // ===========================================================
    // CURRENT USER
    // ===========================================================

    let currentUser = null;

    try {

        currentUser = JSON.parse(
            localStorage.getItem("currentUser") || "null"
        );

    } catch (error) {

        console.error("Current user error:", error);

    }


    // ===========================================================
    // FALLBACK USER DATA
    // ===========================================================

    if (!currentUser) {

        currentUser = {

            id:
                localStorage.getItem("user_id") || "",

            name:
                localStorage.getItem("user_name") || "",

            phone:
                localStorage.getItem("user_phone") || "",

            location:
                localStorage.getItem("user_location") || "",

            latitude:
                localStorage.getItem("user_latitude") || "",

            longitude:
                localStorage.getItem("user_longitude") || ""

        };

    }


    console.log("Current User:", currentUser);


    // ===========================================================
    // ELEMENTS
    // ===========================================================

    const checkTab =
        document.getElementById("checkTab");

    const statusTab =
        document.getElementById("statusTab");

    const historyTab =
        document.getElementById("historyTab");


    const checkSection =
        document.getElementById("checkSection");

    const statusSection =
        document.getElementById("statusSection");

    const historySection =
        document.getElementById("historySection");


    const checkBtn =
        document.getElementById("checkBtn");

    const sosBtn =
        document.getElementById("sosBtn");

    const shareBtn =
        document.getElementById("shareBtn");


    const mobileNumber =
        document.getElementById("mobileNumber");

    const userName =
        document.getElementById("userName");

    const mobileDisplay =
        document.getElementById("mobileDisplay");

    const locationName =
        document.getElementById("locationName");


    const statusText =
        document.getElementById("statusText");

    const statusTime =
        document.getElementById("statusTime");


    const historyList =
        document.getElementById("historyList");


    // ===========================================================
    // MOBILE MENU
    // ===========================================================

    const menuIcon =
        document.getElementById("menuIcon");

    const navLinks =
        document.getElementById("navLinks");


    if (menuIcon && navLinks) {

        menuIcon.addEventListener("click", function () {

            navLinks.classList.toggle("active");

        });

    }


    // ===========================================================
    // LOAD USER INFORMATION
    // ===========================================================

    function loadUserInfo() {

        const name =
            currentUser.name || "Not Registered";

        const phone =
            currentUser.phone || "Not Registered";

        const location =
            currentUser.location || "Waiting...";


        if (mobileNumber) {

            mobileNumber.textContent = phone;

        }


        if (userName) {

            userName.textContent = name;

        }


        if (mobileDisplay) {

            mobileDisplay.textContent = phone;

        }


        if (locationName) {

            locationName.textContent = location;

        }

    }


    // ===========================================================
    // TAB FUNCTION
    // ===========================================================

    function showTab(tab) {

        console.log("Showing tab:", tab);


        // -------------------------------------------------------
        // HIDE ALL
        // -------------------------------------------------------

        checkSection.style.display = "none";

        statusSection.style.display = "none";

        historySection.style.display = "none";


        // -------------------------------------------------------
        // REMOVE ACTIVE
        // -------------------------------------------------------

        checkTab.classList.remove("active");

        statusTab.classList.remove("active");

        historyTab.classList.remove("active");


        // -------------------------------------------------------
        // CHECK
        // -------------------------------------------------------

        if (tab === "check") {

            checkSection.style.display = "block";

            checkTab.classList.add("active");

        }


        // -------------------------------------------------------
        // STATUS
        // -------------------------------------------------------

        else if (tab === "status") {

            statusSection.style.display = "block";

            statusTab.classList.add("active");

            loadStatus();

        }


        // -------------------------------------------------------
        // HISTORY
        // -------------------------------------------------------

        else if (tab === "history") {

            historySection.style.display = "block";

            historyTab.classList.add("active");

            loadHistory();

        }

    }


    // ===========================================================
    // CHECK TAB CLICK
    // ===========================================================

    checkTab.addEventListener("click", function (event) {

        event.preventDefault();

        showTab("check");

    });


    // ===========================================================
    // STATUS TAB CLICK
    // ===========================================================

    statusTab.addEventListener("click", function (event) {

        event.preventDefault();

        showTab("status");

    });


    // ===========================================================
    // HISTORY TAB CLICK
    // ===========================================================

    historyTab.addEventListener("click", function (event) {

        event.preventDefault();

        showTab("history");

    });


    // ===========================================================
    // GET LOCATION NAME
    // ===========================================================

    async function getLocationName(latitude, longitude) {

        try {

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Location service failed"
                );

            }


            const data =
                await response.json();


            return (

                data.address?.village ||

                data.address?.town ||

                data.address?.city ||

                data.address?.municipality ||

                data.address?.county ||

                data.address?.state ||

                data.display_name ||

                "Unknown"

            );

        }

        catch (error) {

            console.error(
                "Reverse geocoding error:",
                error
            );

            return "Unknown";

        }

    }


    // ===========================================================
    // CHECK-IN
    // ===========================================================

    if (checkBtn) {

        checkBtn.addEventListener(
            "click",
            function () {

                if (!navigator.geolocation) {

                    alert(
                        "Geolocation is not supported."
                    );

                    return;

                }


                checkBtn.disabled = true;

                checkBtn.innerHTML =
                    "CHECKING LOCATION...";


                navigator.geolocation.getCurrentPosition(

                    async function (position) {

                        const latitude =
                            position.coords.latitude;

                        const longitude =
                            position.coords.longitude;


                        const location =
                            await getLocationName(
                                latitude,
                                longitude
                            );


                        const time =
                            new Date().toISOString();


                        // ------------------------------------------------
                        // UPDATE USER
                        // ------------------------------------------------

                        currentUser.latitude =
                            latitude;

                        currentUser.longitude =
                            longitude;

                        currentUser.location =
                            location;


                        localStorage.setItem(
                            "currentUser",
                            JSON.stringify(currentUser)
                        );


                        localStorage.setItem(
                            "user_latitude",
                            latitude
                        );


                        localStorage.setItem(
                            "user_longitude",
                            longitude
                        );


                        localStorage.setItem(
                            "user_location",
                            location
                        );


                        // ------------------------------------------------
                        // DISPLAY
                        // ------------------------------------------------

                        if (locationName) {

                            locationName.textContent =
                                location;

                        }


                        if (statusText) {

                            statusText.textContent =
                                "SAFE";

                            statusText.style.color =
                                "#00e676";

                        }


                        if (statusTime) {

                            statusTime.textContent =
                                "Last Check-in : " +
                                new Date(time)
                                    .toLocaleString();

                        }


                        // ------------------------------------------------
                        // SAVE HISTORY
                        // ------------------------------------------------

                        saveLocalHistory({

                            status: "SAFE",

                            location: location,

                            time: time

                        });


                        checkBtn.disabled = false;

                        checkBtn.innerHTML =
                            '<i class="fa-solid fa-shield-heart"></i> CHECK-IN NOW';


                        alert(
                            "Check-in Successful!\n\n" +
                            "Location: " +
                            location
                        );

                    },


                    function (error) {

                        console.error(
                            "GPS Error:",
                            error
                        );


                        alert(
                            "Unable to get your current location.\n\n" +
                            "Please allow location permission."
                        );


                        checkBtn.disabled = false;

                        checkBtn.innerHTML =
                            '<i class="fa-solid fa-shield-heart"></i> CHECK-IN NOW';

                    },


                    {

                        enableHighAccuracy: true,

                        timeout: 15000,

                        maximumAge: 0

                    }

                );

            }
        );

    }


    // ===========================================================
    // SOS BUTTON
    // ===========================================================

    if (sosBtn) {

        sosBtn.addEventListener(
            "click",
            async function () {

                if (!currentUser.name &&
                    !currentUser.phone) {

                    alert(
                        "User information not found."
                    );

                    return;

                }


                if (!navigator.geolocation) {

                    alert(
                        "Geolocation is not supported."
                    );

                    return;

                }


                sosBtn.disabled = true;

                sosBtn.innerHTML =
                    "SENDING SOS...";


                navigator.geolocation.getCurrentPosition(

                    async function (position) {

                        const latitude =
                            position.coords.latitude;

                        const longitude =
                            position.coords.longitude;


                        const location =
                            await getLocationName(
                                latitude,
                                longitude
                            );


                        const now =
                            new Date().toISOString();


                        const sosData = {

                            user_id:
                                currentUser.id
                                    ? Number(currentUser.id)
                                    : null,

                            name:
                                currentUser.name || "",

                            phone:
                                currentUser.phone || "",

                            location:
                                location,

                            latitude:
                                latitude,

                            longitude:
                                longitude,

                            status:
                                "Emergency Requested",

                            message:
                                "SOS Emergency Alert",

                            time:
                                now,

                            created_at:
                                now,

                            updated_at:
                                now

                        };


                        console.log(
                            "SOS Data:",
                            sosData
                        );


                        try {

                            const {
                                error
                            } =
                                await supabase
                                    .from(
                                        "emergency_alerts"
                                    )
                                    .insert([
                                        sosData
                                    ]);


                            if (error) {

                                console.error(
                                    "Supabase error:",
                                    error
                                );

                                throw error;

                            }


                            // ---------------------------------------------
                            // LOCAL SAVE
                            // ---------------------------------------------

                            localStorage.setItem(
                                "lastSOSStatus",
                                "Emergency Requested"
                            );


                            localStorage.setItem(
                                "lastSOSLocation",
                                location
                            );


                            localStorage.setItem(
                                "lastSOSLatitude",
                                latitude
                            );


                            localStorage.setItem(
                                "lastSOSLongitude",
                                longitude
                            );


                            saveLocalHistory({

                                status:
                                    "Emergency Requested",

                                location:
                                    location,

                                time:
                                    now

                            });


                            // ---------------------------------------------
                            // UPDATE USER STATUS
                            // ---------------------------------------------

                            if (statusText) {

                                statusText.textContent =
                                    "🚨 SOS SENT";

                                statusText.style.color =
                                    "#ff3333";

                            }


                            if (statusTime) {

                                statusTime.textContent =
                                    "Emergency Requested : " +
                                    new Date()
                                        .toLocaleString();

                            }


                            if (locationName) {

                                locationName.textContent =
                                    location;

                            }


                            alert(
                                "SOS Alert Sent Successfully!\n\n" +
                                "Location: " +
                                location
                            );


                        }

                        catch (error) {

                            console.error(
                                "SOS error:",
                                error
                            );


                            alert(
                                "Unable to send SOS alert.\n\n" +
                                "Error: " +
                                (
                                    error.message ||
                                    "Unknown error"
                                )
                            );

                        }


                        sosBtn.disabled = false;

                        sosBtn.innerHTML =
                            '<i class="fa-solid fa-triangle-exclamation"></i> SEND SOS ALERT';

                    },


                    function (error) {

                        console.error(
                            "Location error:",
                            error
                        );


                        alert(
                            "Unable to get your current location.\n\n" +
                            "Please allow GPS permission."
                        );


                        sosBtn.disabled = false;

                        sosBtn.innerHTML =
                            '<i class="fa-solid fa-triangle-exclamation"></i> SEND SOS ALERT';

                    },


                    {

                        enableHighAccuracy: true,

                        timeout: 15000,

                        maximumAge: 0

                    }

                );

            }
        );

    }


    // ===========================================================
    // SHARE LOCATION
    // ===========================================================

    if (shareBtn) {

        shareBtn.addEventListener(
            "click",
            function () {

                if (!navigator.geolocation) {

                    alert(
                        "Geolocation is not supported."
                    );

                    return;

                }


                shareBtn.disabled = true;

                shareBtn.innerHTML =
                    "GETTING LOCATION...";


                navigator.geolocation.getCurrentPosition(

                    function (position) {

                        const latitude =
                            position.coords.latitude
                                .toFixed(6);

                        const longitude =
                            position.coords.longitude
                                .toFixed(6);


                        const mapLink =
                            `https://www.google.com/maps?q=${latitude},${longitude}`;


                        if (
                            navigator.clipboard
                        ) {

                            navigator.clipboard
                                .writeText(mapLink)
                                .then(
                                    function () {

                                        alert(
                                            "Location link copied!\n\n" +
                                            mapLink
                                        );

                                    }
                                )
                                .catch(
                                    function () {

                                        alert(
                                            mapLink
                                        );

                                    }
                                );

                        }

                        else {

                            alert(
                                mapLink
                            );

                        }


                        shareBtn.disabled = false;

                        shareBtn.innerHTML =
                            '<i class="fa-solid fa-location-dot"></i> SHARE LOCATION';

                    },


                    function (error) {

                        console.error(
                            "Location error:",
                            error
                        );


                        alert(
                            "Unable to get your location."
                        );


                        shareBtn.disabled = false;

                        shareBtn.innerHTML =
                            '<i class="fa-solid fa-location-dot"></i> SHARE LOCATION';

                    },


                    {

                        enableHighAccuracy: true,

                        timeout: 15000,

                        maximumAge: 0

                    }

                );

            }
        );

    }


    // ===========================================================
    // SAVE LOCAL HISTORY
    // ===========================================================

    function saveLocalHistory(item) {

        let history = [];


        try {

            history =
                JSON.parse(
                    localStorage.getItem(
                        "smsHistory"
                    ) || "[]"
                );

        }

        catch (error) {

            history = [];

        }


        history.unshift(item);


        history =
            history.slice(0, 30);


        localStorage.setItem(
            "smsHistory",
            JSON.stringify(history)
        );

    }


    // ===========================================================
    // LOAD STATUS
    // ===========================================================

    async function loadStatus() {

        if (statusText) {

            statusText.textContent =
                "Loading...";

        }


        const phone =
            currentUser.phone ||
            localStorage.getItem("user_phone");


        if (!phone) {

            showLocalStatus();

            return;

        }


        try {

            const {
                data,
                error
            } =
                await supabase
                    .from("emergency_alerts")
                    .select("*")
                    .eq("phone", phone)
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
                data &&
                data.length > 0
            ) {

                const emergency =
                    data[0];


                displayStatus(

                    emergency.status ||
                    "Emergency Requested",

                    emergency.location ||
                    "Unknown",

                    emergency.updated_at ||
                    emergency.created_at

                );

            }

            else {

                showLocalStatus();

            }

        }

        catch (error) {

            console.error(
                "Status loading error:",
                error
            );


            showLocalStatus();

        }

    }


    // ===========================================================
    // LOCAL STATUS
    // ===========================================================

    function showLocalStatus() {

        const savedStatus =
            localStorage.getItem(
                "lastSOSStatus"
            );


        const savedLocation =
            localStorage.getItem(
                "lastSOSLocation"
            );


        if (savedStatus) {

            displayStatus(

                savedStatus,

                savedLocation ||
                "Unknown",

                "Recently"

            );

        }

        else {

            if (statusText) {

                statusText.textContent =
                    "SAFE";

                statusText.style.color =
                    "#00e676";

            }


            if (statusTime) {

                statusTime.textContent =
                    "No emergency request found";

            }

        }

    }


    // ===========================================================
    // DISPLAY STATUS
    // ===========================================================

    function displayStatus(
        status,
        location,
        time
    ) {

        let color = "#00e676";


        let icon = "🟢";


        if (
            status ===
            "Emergency Requested"
        ) {

            color = "#ff3333";

            icon = "🚨";

        }

        else if (
            status ===
            "Under Review"
        ) {

            color = "#ff9800";

            icon = "🔎";

        }

        else if (
            status ===
            "Rescue in Progress"
        ) {

            color = "#ff5722";

            icon = "🚑";

        }

        else if (
            status ===
            "Safe to Return"
        ) {

            color = "#00e676";

            icon = "🟢";

        }

        else if (
            status ===
            "Resolved"
        ) {

            color = "#00e676";

            icon = "✅";

        }


        if (statusText) {

            statusText.textContent =
                icon + " " + status;

            statusText.style.color =
                color;

        }


        if (statusTime) {

            statusTime.textContent =
                "Status Updated : " +
                formatDate(time);

        }


        if (locationName) {

            locationName.textContent =
                location || "Unknown";

        }

    }


    // ===========================================================
    // LOAD HISTORY
    // ===========================================================

    async function loadHistory() {

        if (!historyList) {

            return;

        }


        historyList.innerHTML =
            `
            <li>
                Loading history...
            </li>
            `;


        let allHistory = [];


        // -------------------------------------------------------
        // LOCAL HISTORY
        // -------------------------------------------------------

        try {

            const localHistory =
                JSON.parse(
                    localStorage.getItem(
                        "smsHistory"
                    ) || "[]"
                );


            allHistory =
                allHistory.concat(
                    localHistory
                );

        }

        catch (error) {

            console.error(
                "Local history error:",
                error
            );

        }


        // -------------------------------------------------------
        // SUPABASE HISTORY
        // -------------------------------------------------------

        const phone =
            currentUser.phone ||
            localStorage.getItem("user_phone");


        if (phone) {

            try {

                const {
                    data,
                    error
                } =
                    await supabase
                        .from("emergency_alerts")
                        .select(
                            "status,location,created_at,updated_at"
                        )
                        .eq("phone", phone)
                        .order(
                            "created_at",
                            {
                                ascending: false
                            }
                        )
                        .limit(30);


                if (!error && data) {

                    data.forEach(
                        function (item) {

                            allHistory.push({

                                status:
                                    item.status ||
                                    "Emergency",

                                location:
                                    item.location ||
                                    "Unknown",

                                time:
                                    item.updated_at ||
                                    item.created_at

                            });

                        }
                    );

                }

            }

            catch (error) {

                console.error(
                    "Supabase history error:",
                    error
                );

            }

        }


        // -------------------------------------------------------
        // SORT
        // -------------------------------------------------------

        allHistory.sort(
            function (a, b) {

                return (
                    new Date(b.time || 0) -
                    new Date(a.time || 0)
                );

            }
        );


        // -------------------------------------------------------
        // NO HISTORY
        // -------------------------------------------------------

        if (allHistory.length === 0) {

            historyList.innerHTML =
                `
                <li>
                    📋 No Check-in History Available
                </li>
                `;

            return;

        }


        // -------------------------------------------------------
        // DISPLAY
        // -------------------------------------------------------

        historyList.innerHTML = "";


        allHistory
            .slice(0, 30)
            .forEach(
                function (item) {

                    const li =
                        document.createElement(
                            "li"
                        );


                    let icon = "🟢";


                    if (
                        item.status ===
                        "Emergency Requested"
                    ) {

                        icon = "🚨";

                    }

                    else if (
                        item.status ===
                        "Under Review"
                    ) {

                        icon = "🔎";

                    }

                    else if (
                        item.status ===
                        "Rescue in Progress"
                    ) {

                        icon = "🚑";

                    }

                    else if (
                        item.status ===
                        "Resolved"
                    ) {

                        icon = "✅";

                    }


                    li.innerHTML =
                        `
                        <strong>
                            ${icon}
                            ${escapeHTML(item.status)}
                        </strong>

                        <br>

                        <span>
                            📍
                            ${escapeHTML(
                                item.location ||
                                "Unknown"
                            )}
                        </span>

                        <br>

                        <small>
                            🕒
                            ${escapeHTML(
                                formatDate(item.time)
                            )}
                        </small>
                        `;


                    historyList.appendChild(li);

                }
            );

    }


    // ===========================================================
    // FORMAT DATE
    // ===========================================================

    function formatDate(value) {

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


    // ===========================================================
    // ESCAPE HTML
    // ===========================================================

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // ===========================================================
    // INITIAL USER DISPLAY
    // ===========================================================

    loadUserInfo();


    // ===========================================================
    // DEFAULT TAB
    // ===========================================================

    showTab("check");


    console.log(
        "CHECK-IN / STATUS / HISTORY initialized successfully"
    );

});