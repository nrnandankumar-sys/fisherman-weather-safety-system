// ===============================================================
// SUPABASE
// ===============================================================

import { supabase } from "./supabase-config.js";


// ===============================================================
// PAGE LOAD
// ===============================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Status / History JS Loaded");


    // ===========================================================
    // LOGIN CHECK
    // ===========================================================

    if (
        localStorage.getItem("isLoggedIn") !== "true"
    ) {

        alert("Please Login First");

        window.location.href = "index.html";

        return;
    }


    // ===========================================================
    // REGISTRATION CHECK
    // ===========================================================

    const isRegistered =
        localStorage.getItem("isRegistered") === "true";


    if (!isRegistered) {

        const register = confirm(
            "You are not registered as a fisherman.\n\n" +
            "Click OK to Register Now.\n" +
            "Click Cancel for Later."
        );


        if (register) {

            window.location.href =
                "register.html";

        } else {

            window.location.href =
                "main.html";
        }

        return;
    }


    // ===========================================================
    // CURRENT USER
    // ===========================================================

    let registeredUser = null;


    try {

        registeredUser =
            JSON.parse(
                localStorage.getItem("currentUser") ||
                "null"
            );

    } catch (error) {

        console.error(
            "Current user JSON error:",
            error
        );

        registeredUser = null;
    }


    if (!registeredUser) {

        registeredUser = {

            id:
                localStorage.getItem("user_id") ||
                null,

            name:
                localStorage.getItem("user_name") ||
                "",

            phone:
                localStorage.getItem("user_phone") ||
                "",

            location:
                localStorage.getItem("user_location") ||
                ""
        };
    }


    if (
        !registeredUser.name &&
        !registeredUser.phone
    ) {

        alert(
            "User information not found."
        );

        window.location.href =
            "main.html";

        return;
    }


    // ===========================================================
    // NAVIGATION
    // ===========================================================

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


    // ===========================================================
    // BUTTONS
    // ===========================================================

    const checkBtn =
        document.getElementById("checkBtn");

    const sosBtn =
        document.getElementById("sosBtn");

    const shareBtn =
        document.getElementById("shareBtn");


    // ===========================================================
    // TABS
    // ===========================================================

    const checkTab =
        document.getElementById("checkTab");

    const statusTab =
        document.getElementById("statusTab");

    const historyTab =
        document.getElementById("historyTab");


    // ===========================================================
    // SECTIONS
    // ===========================================================

    const checkSection =
        document.getElementById("checkSection");

    const statusSection =
        document.getElementById("statusSection");

    const historySection =
        document.getElementById("historySection");


    // ===========================================================
    // STATUS ELEMENTS
    // ===========================================================

    const statusText =
        document.getElementById("statusText");

    const statusTime =
        document.getElementById("statusTime");

    const locationName =
        document.getElementById("locationName");


    // ===========================================================
    // HISTORY
    // ===========================================================

    const historyList =
        document.getElementById("historyList");


    // ===========================================================
    // TAB DISPLAY FUNCTION
    // ===========================================================

    function showTab(tabName) {

        console.log(
            "Opening tab:",
            tabName
        );


        // -------------------------------------------------------
        // HIDE ALL SECTIONS
        // -------------------------------------------------------

        if (checkSection) {

            checkSection.style.display =
                "none";

        }


        if (statusSection) {

            statusSection.style.display =
                "none";

        }


        if (historySection) {

            historySection.style.display =
                "none";

        }


        // -------------------------------------------------------
        // REMOVE ACTIVE FROM ALL TABS
        // -------------------------------------------------------

        if (checkTab) {

            checkTab.classList.remove(
                "active"
            );
        }


        if (statusTab) {

            statusTab.classList.remove(
                "active"
            );
        }


        if (historyTab) {

            historyTab.classList.remove(
                "active"
            );
        }


        // -------------------------------------------------------
        // SHOW SELECTED TAB
        // -------------------------------------------------------

        if (tabName === "check") {

            if (checkSection) {

                checkSection.style.display =
                    "block";
            }


            if (checkTab) {

                checkTab.classList.add(
                    "active"
                );
            }
        }


        // -------------------------------------------------------

        else if (
            tabName === "status"
        ) {

            if (statusSection) {

                statusSection.style.display =
                    "block";
            }


            if (statusTab) {

                statusTab.classList.add(
                    "active"
                );
            }


            // Load latest status
            loadLatestStatus();
        }


        // -------------------------------------------------------

        else if (
            tabName === "history"
        ) {

            if (historySection) {

                historySection.style.display =
                    "block";
            }


            if (historyTab) {

                historyTab.classList.add(
                    "active"
                );
            }


            // Load history
            loadHistory();
        }
    }


    // ===========================================================
    // CHECK TAB
    // ===========================================================

    if (checkTab) {

        checkTab.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showTab("check");

            }
        );
    }


    // ===========================================================
    // STATUS TAB
    // ===========================================================

    if (statusTab) {

        statusTab.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showTab("status");

            }
        );
    }


    // ===========================================================
    // HISTORY TAB
    // ===========================================================

    if (historyTab) {

        historyTab.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showTab("history");

            }
        );
    }


    // ===========================================================
    // LOAD USER
    // ===========================================================

    function loadUser() {

        const user =
            registeredUser;


        const mobileNumber =
            document.getElementById(
                "mobileNumber"
            );


        const userName =
            document.getElementById(
                "userName"
            );


        const mobileDisplay =
            document.getElementById(
                "mobileDisplay"
            );


        if (mobileNumber) {

            mobileNumber.textContent =
                user.phone || "Not Registered";
        }


        if (userName) {

            userName.textContent =
                user.name || "";
        }


        if (mobileDisplay) {

            mobileDisplay.textContent =
                user.phone ||
                "Not Registered";
        }
    }


    // ===========================================================
    // CHECK-IN
    // ===========================================================

    if (checkBtn) {

        checkBtn.addEventListener(
            "click",
            function () {

                const user =
                    registeredUser;


                if (!user) {

                    alert(
                        "Please Register First"
                    );

                    return;
                }


                if (
                    !navigator.geolocation
                ) {

                    alert(
                        "Geolocation not supported"
                    );

                    return;
                }


                const now =
                    new Date().toLocaleString();


                checkBtn.disabled =
                    true;


                checkBtn.innerHTML =
                    "Checking...";


                navigator.geolocation.getCurrentPosition(

                    async function (position) {

                        const latitude =
                            position.coords.latitude;


                        const longitude =
                            position.coords.longitude;


                        // ------------------------------------------------
                        // UPDATE STATUS
                        // ------------------------------------------------

                        updateStatusUI(
                            "SAFE",
                            now,
                            "#00e676"
                        );


                        // ------------------------------------------------
                        // GET LOCATION NAME
                        // ------------------------------------------------

                        let place =
                            "Unknown";


                        try {

                            const response =
                                await fetch(
                                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                                    {
                                        headers: {
                                            "Accept":
                                                "application/json"
                                        }
                                    }
                                );


                            if (
                                !response.ok
                            ) {

                                throw new Error(
                                    "Unable to get location"
                                );
                            }


                            const data =
                                await response.json();


                            place =
                                data.address?.city ||

                                data.address?.town ||

                                data.address?.village ||

                                data.address?.municipality ||

                                data.address?.county ||

                                data.address?.state ||

                                data.display_name ||

                                "Unknown";


                        } catch (error) {

                            console.error(
                                "Location Error:",
                                error
                            );

                            place =
                                "Unknown";
                        }


                        // ------------------------------------------------
                        // LOCATION DISPLAY
                        // ------------------------------------------------

                        if (locationName) {

                            locationName.textContent =
                                place;
                        }


                        // ------------------------------------------------
                        // SAVE LOCAL HISTORY
                        // ------------------------------------------------

                        saveHistory(
                            "SAFE",
                            place,
                            now
                        );


                        // ------------------------------------------------
                        // SAVE LOCATION
                        // ------------------------------------------------

                        localStorage.setItem(
                            "last_checkin_latitude",
                            String(latitude)
                        );


                        localStorage.setItem(
                            "last_checkin_longitude",
                            String(longitude)
                        );


                        localStorage.setItem(
                            "last_checkin_location",
                            place
                        );


                        checkBtn.disabled =
                            false;


                        checkBtn.innerHTML =
                            "CHECK-IN NOW";
                    },


                    function (error) {

                        console.error(
                            "Geolocation Error:",
                            error
                        );


                        alert(
                            "Unable to get your location."
                        );


                        checkBtn.disabled =
                            false;


                        checkBtn.innerHTML =
                            "CHECK-IN NOW";
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
    // SOS
    // ===========================================================

    if (sosBtn) {

        sosBtn.addEventListener(
            "click",
            async function () {

                const user =
                    registeredUser;


                if (!user) {

                    alert(
                        "Please Register First"
                    );

                    return;
                }


                if (
                    !navigator.geolocation
                ) {

                    alert(
                        "Geolocation not supported"
                    );

                    return;
                }


                sosBtn.disabled =
                    true;


                sosBtn.innerHTML =
                    "SENDING SOS...";


                navigator.geolocation.getCurrentPosition(

                    async function (position) {

                        const latitude =
                            position.coords.latitude;


                        const longitude =
                            position.coords.longitude;


                        let location =
                            "Unknown";


                        // ------------------------------------------------
                        // GET LOCATION
                        // ------------------------------------------------

                        try {

                            const response =
                                await fetch(
                                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                                    {
                                        headers: {
                                            "Accept":
                                                "application/json"
                                        }
                                    }
                                );


                            if (
                                response.ok
                            ) {

                                const data =
                                    await response.json();


                                location =
                                    data.address?.city ||

                                    data.address?.town ||

                                    data.address?.village ||

                                    data.address?.municipality ||

                                    data.address?.county ||

                                    data.address?.state ||

                                    data.display_name ||

                                    "Unknown";
                            }

                        } catch (error) {

                            console.error(
                                "Reverse geocoding error:",
                                error
                            );
                        }


                        // ------------------------------------------------
                        // SAVE SOS TO SUPABASE
                        // IMPORTANT:
                        // NO .select().single()
                        // ------------------------------------------------

                        try {

                            const sosData = {

                                name:
                                    user.name ||
                                    localStorage.getItem(
                                        "user_name"
                                    ) ||
                                    "",

                                phone:
                                    user.phone ||
                                    localStorage.getItem(
                                        "user_phone"
                                    ) ||
                                    "",

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
                                    new Date().toISOString(),

                                created_at:
                                    new Date().toISOString(),

                                updated_at:
                                    new Date().toISOString()
                            };


                            console.log(
                                "SOS Data:",
                                sosData
                            );


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
                                    "Supabase SOS Error:",
                                    error
                                );

                                throw error;
                            }


                            // ------------------------------------------------
                            // UPDATE STATUS
                            // ------------------------------------------------

                            updateStatusUI(
                                "SOS SENT",
                                "Emergency Requested : " +
                                new Date().toLocaleString(),
                                "#ff3333"
                            );


                            // ------------------------------------------------
                            // SAVE HISTORY
                            // ------------------------------------------------

                            saveHistory(
                                "SOS SENT",
                                location,
                                new Date().toLocaleString()
                            );


                            // ------------------------------------------------
                            // SAVE LOCAL SOS DATA
                            // ------------------------------------------------

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
                                String(latitude)
                            );


                            localStorage.setItem(
                                "lastSOSLongitude",
                                String(longitude)
                            );


                            alert(
                                "SOS Alert Sent Successfully\n\n" +
                                "Location: " +
                                location
                            );


                        } catch (error) {

                            console.error(
                                "SOS Error:",
                                error
                            );


                            alert(
                                "Unable to send SOS alert.\n\n" +
                                "Error: " +
                                (
                                    error?.message ||
                                    "Unknown error"
                                )
                            );


                        } finally {

                            sosBtn.disabled =
                                false;


                            sosBtn.innerHTML =
                                "SEND SOS ALERT";
                        }
                    },


                    function (error) {

                        console.error(
                            "Geolocation Error:",
                            error
                        );


                        alert(
                            "Unable to fetch your location."
                        );


                        sosBtn.disabled =
                            false;


                        sosBtn.innerHTML =
                            "SEND SOS ALERT";
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

                if (
                    !navigator.geolocation
                ) {

                    alert(
                        "Geolocation not supported"
                    );

                    return;
                }


                shareBtn.disabled =
                    true;


                shareBtn.innerHTML =
                    "GETTING LOCATION...";


                navigator.geolocation.getCurrentPosition(

                    function (position) {

                        const lat =
                            position.coords.latitude
                                .toFixed(6);


                        const lon =
                            position.coords.longitude
                                .toFixed(6);


                        const link =
                            `https://www.google.com/maps?q=${lat},${lon}`;


                        if (
                            navigator.clipboard
                        ) {

                            navigator.clipboard
                                .writeText(link)
                                .then(
                                    function () {

                                        alert(
                                            "Location Copied\n\n" +
                                            link
                                        );
                                    }
                                )
                                .catch(
                                    function () {

                                        alert(link);
                                    }
                                );

                        } else {

                            alert(link);
                        }


                        shareBtn.disabled =
                            false;


                        shareBtn.innerHTML =
                            "SHARE LOCATION";
                    },


                    function (error) {

                        console.error(
                            "Share location error:",
                            error
                        );


                        alert(
                            "Unable to fetch your location."
                        );


                        shareBtn.disabled =
                            false;


                        shareBtn.innerHTML =
                            "SHARE LOCATION";
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
    // UPDATE STATUS UI
    // ===========================================================

    function updateStatusUI(
        status,
        time,
        color
    ) {

        if (statusText) {

            statusText.textContent =
                status;

            statusText.style.color =
                color;
        }


        if (statusTime) {

            statusTime.textContent =
                time;
        }
    }


    // ===========================================================
    // LOAD LATEST STATUS FROM SUPABASE
    // ===========================================================

    async function loadLatestStatus() {

        console.log(
            "Loading latest emergency status..."
        );


        // -------------------------------------------------------
        // SHOW LOADING
        // -------------------------------------------------------

        if (statusText) {

            statusText.textContent =
                "Loading...";

            statusText.style.color =
                "#ffffff";
        }


        if (statusTime) {

            statusTime.textContent =
                "Checking latest status...";
        }


        try {

            const phone =
                registeredUser.phone ||
                localStorage.getItem(
                    "user_phone"
                );


            if (!phone) {

                throw new Error(
                    "Phone number not found"
                );
            }


            // ---------------------------------------------------
            // GET LATEST EMERGENCY
            // ---------------------------------------------------

            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "emergency_alerts"
                    )
                    .select("*")
                    .eq(
                        "phone",
                        phone
                    )
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


            // ---------------------------------------------------
            // NO EMERGENCY
            // ---------------------------------------------------

            if (
                !data ||
                data.length === 0
            ) {

                const savedStatus =
                    localStorage.getItem(
                        "lastSOSStatus"
                    );


                if (savedStatus) {

                    displayEmergencyStatus(
                        savedStatus,
                        localStorage.getItem(
                            "lastSOSLocation"
                        ) ||
                        "Unknown",
                        "Recently"
                    );

                } else {

                    updateStatusUI(
                        "SAFE",
                        "No emergency request found",
                        "#00e676"
                    );
                }


                return;
            }


            // ---------------------------------------------------
            // LATEST EMERGENCY
            // ---------------------------------------------------

            const emergency =
                data[0];


            displayEmergencyStatus(
                emergency.status ||
                "Emergency Requested",

                emergency.location ||
                "Unknown",

                emergency.updated_at ||
                emergency.created_at
            );


        } catch (error) {

            console.error(
                "Load status error:",
                error
            );


            // ---------------------------------------------------
            // FALLBACK LOCAL STATUS
            // ---------------------------------------------------

            const savedStatus =
                localStorage.getItem(
                    "lastSOSStatus"
                );


            if (savedStatus) {

                displayEmergencyStatus(
                    savedStatus,

                    localStorage.getItem(
                        "lastSOSLocation"
                    ) ||
                    "Unknown",

                    "Recently"
                );

            } else {

                updateStatusUI(
                    "SAFE",
                    "Unable to load latest status",
                    "#00e676"
                );
            }
        }
    }


    // ===========================================================
    // DISPLAY EMERGENCY STATUS
    // ===========================================================

    function displayEmergencyStatus(
        status,
        location,
        time
    ) {

        let color =
            "#00e676";


        let icon =
            "🟢";


        switch (status) {

            case "Emergency Requested":

                color =
                    "#ff3333";

                icon =
                    "🚨";

                break;


            case "Under Review":

                color =
                    "#ff9800";

                icon =
                    "🔎";

                break;


            case "Rescue in Progress":

                color =
                    "#ff5722";

                icon =
                    "🚑";

                break;


            case "Safe to Return":

                color =
                    "#00e676";

                icon =
                    "🟢";

                break;


            case "Resolved":

                color =
                    "#00e676";

                icon =
                    "✅";

                break;


            case "SOS SENT":

                color =
                    "#ff3333";

                icon =
                    "🚨";

                break;


            case "SAFE":

                color =
                    "#00e676";

                icon =
                    "🟢";

                break;
        }


        if (statusText) {

            statusText.innerHTML =
                icon +
                " " +
                escapeHTML(status);

            statusText.style.color =
                color;
        }


        if (statusTime) {

            statusTime.innerHTML =
                "Status Updated : " +
                escapeHTML(
                    formatDate(time)
                );
        }


        if (locationName) {

            locationName.innerHTML =
                "📍 " +
                escapeHTML(
                    location ||
                    "Unknown"
                );
        }


        // -------------------------------------------------------
        // EXTRA STATUS INFORMATION
        // -------------------------------------------------------

        showStatusDetails(
            status,
            location
        );
    }


    // ===========================================================
    // STATUS DETAILS
    // ===========================================================

    function showStatusDetails(
        status,
        location
    ) {

        let statusDetails =
            document.getElementById(
                "statusDetails"
            );


        if (!statusDetails) {

            if (!statusSection) {
                return;
            }


            statusDetails =
                document.createElement(
                    "div"
                );


            statusDetails.id =
                "statusDetails";


            statusDetails.style.marginTop =
                "20px";


            statusDetails.style.padding =
                "18px";


            statusDetails.style.borderRadius =
                "12px";


            statusDetails.style.background =
                "rgba(0,0,0,0.20)";


            statusDetails.style.border =
                "1px solid rgba(255,255,255,0.15)";


            statusSection.appendChild(
                statusDetails
            );
        }


        let message =
            "";


        if (
            status ===
            "Emergency Requested"
        ) {

            message =
                "🚨 Emergency request has been received. Please stay calm and wait for admin/rescue updates.";

        }

        else if (
            status ===
            "Under Review"
        ) {

            message =
                "🔎 Your emergency request is currently under review by the admin.";

        }

        else if (
            status ===
            "Rescue in Progress"
        ) {

            message =
                "🚑 Rescue operation is currently in progress.";

        }

        else if (
            status ===
            "Safe to Return"
        ) {

            message =
                "🟢 Admin has updated the status. It is safe to return.";

        }

        else if (
            status ===
            "Resolved"
        ) {

            message =
                "✅ Emergency has been resolved.";

        }

        else {

            message =
                "🟢 No active emergency request.";
        }


        statusDetails.innerHTML =
            `
            <h3 style="
                margin-top:0;
                margin-bottom:10px;
            ">
                Current Safety Status
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

            <p>
                📍 <strong>Location:</strong>
                ${escapeHTML(
                    location ||
                    "Unknown"
                )}
            </p>
            `;
    }


    // ===========================================================
    // SAVE HISTORY
    // ===========================================================

    function saveHistory(
        status,
        location,
        time
    ) {

        try {

            let history =
                JSON.parse(
                    localStorage.getItem(
                        "smsHistory"
                    ) ||
                    "[]"
                );


            history.unshift({

                status:
                    status,

                location:
                    location,

                time:
                    time
            });


            if (
                history.length > 20
            ) {

                history =
                    history.slice(
                        0,
                        20
                    );
            }


            localStorage.setItem(
                "smsHistory",
                JSON.stringify(history)
            );


            console.log(
                "History saved:",
                history
            );

        } catch (error) {

            console.error(
                "Save history error:",
                error
            );
        }
    }


    // ===========================================================
    // LOAD HISTORY
    // ===========================================================

    async function loadHistory() {

        if (!historyList) {

            console.warn(
                "historyList element not found"
            );

            return;
        }


        historyList.innerHTML =
            `
            <li style="
                text-align:center;
                padding:15px;
            ">
                Loading history...
            </li>
            `;


        let localHistory = [];


        // -------------------------------------------------------
        // LOCAL HISTORY
        // -------------------------------------------------------

        try {

            localHistory =
                JSON.parse(
                    localStorage.getItem(
                        "smsHistory"
                    ) ||
                    "[]"
                );

        } catch (error) {

            console.error(
                "Local history error:",
                error
            );

            localHistory = [];
        }


        // -------------------------------------------------------
        // SUPABASE EMERGENCY HISTORY
        // -------------------------------------------------------

        let emergencyHistory = [];


        try {

            const phone =
                registeredUser.phone ||
                localStorage.getItem(
                    "user_phone"
                );


            if (phone) {

                const {
                    data,
                    error
                } =
                    await supabase
                        .from(
                            "emergency_alerts"
                        )
                        .select(
                            "status,location,created_at,updated_at"
                        )
                        .eq(
                            "phone",
                            phone
                        )
                        .order(
                            "created_at",
                            {
                                ascending: false
                            }
                        )
                        .limit(20);


                if (!error && data) {

                    emergencyHistory =
                        data.map(
                            function (item) {

                                return {

                                    status:
                                        item.status ||
                                        "Emergency",

                                    location:
                                        item.location ||
                                        "Unknown",

                                    time:
                                        item.updated_at ||
                                        item.created_at
                                };
                            }
                        );
                }
            }

        } catch (error) {

            console.warn(
                "Unable to load Supabase history:",
                error
            );
        }


        // -------------------------------------------------------
        // COMBINE HISTORY
        // -------------------------------------------------------

        const combinedHistory = [

            ...emergencyHistory,

            ...localHistory
        ];


        // -------------------------------------------------------
        // REMOVE DUPLICATES
        // -------------------------------------------------------

        const uniqueHistory =
            [];


        const seen =
            new Set();


        combinedHistory.forEach(
            function (item) {

                const key =
                    (
                        item.status ||
                        ""
                    ) +
                    "|" +
                    (
                        item.location ||
                        ""
                    ) +
                    "|" +
                    (
                        item.time ||
                        ""
                    );


                if (
                    !seen.has(key)
                ) {

                    seen.add(key);

                    uniqueHistory.push(
                        item
                    );
                }
            }
        );


        // -------------------------------------------------------
        // SORT NEWEST FIRST
        // -------------------------------------------------------

        uniqueHistory.sort(
            function (a, b) {

                const dateA =
                    new Date(
                        a.time || 0
                    ).getTime();


                const dateB =
                    new Date(
                        b.time || 0
                    ).getTime();


                return dateB - dateA;
            }
        );


        // -------------------------------------------------------
        // NO HISTORY
        // -------------------------------------------------------

        if (
            uniqueHistory.length === 0
        ) {

            historyList.innerHTML =
                `
                <li style="
                    text-align:center;
                    padding:20px;
                ">
                    📋 No Check-In History Available
                </li>
                `;

            return;
        }


        // -------------------------------------------------------
        // DISPLAY HISTORY
        // -------------------------------------------------------

        historyList.innerHTML =
            "";


        uniqueHistory
            .slice(0, 30)
            .forEach(
                function (item) {

                    const li =
                        document.createElement(
                            "li"
                        );


                    li.style.padding =
                        "15px";


                    li.style.marginBottom =
                        "10px";


                    li.style.borderRadius =
                        "10px";


                    li.style.background =
                        "rgba(255,255,255,0.06)";


                    li.style.border =
                        "1px solid rgba(255,255,255,0.10)";


                    const status =
                        item.status ||
                        "Unknown";


                    const location =
                        item.location ||
                        "Unknown";


                    const time =
                        formatDate(
                            item.time
                        );


                    let icon =
                        "🟢";


                    if (
                        status
                            .toUpperCase()
                            .includes("SOS") ||
                        status ===
                            "Emergency Requested"
                    ) {

                        icon =
                            "🚨";

                    } else if (
                        status ===
                            "Under Review"
                    ) {

                        icon =
                            "🔎";

                    } else if (
                        status ===
                            "Rescue in Progress"
                    ) {

                        icon =
                            "🚑";

                    } else if (
                        status ===
                            "Resolved"
                    ) {

                        icon =
                            "✅";
                    }


                    li.innerHTML =
                        `
                        <div>

                            <strong style="
                                font-size:16px;
                            ">
                                ${icon}
                                ${escapeHTML(status)}
                            </strong>

                            <br>

                            <span>
                                📍
                                ${escapeHTML(location)}
                            </span>

                            <br>

                            <small style="
                                opacity:0.75;
                            ">
                                🕒
                                ${escapeHTML(time)}
                            </small>

                        </div>
                        `;


                    historyList.appendChild(
                        li
                    );
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


        try {

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

        } catch (error) {

            return String(value);
        }
    }


    // ===========================================================
    // ESCAPE HTML
    // ===========================================================

    function escapeHTML(value) {

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


    // ===========================================================
    // INITIAL LOAD
    // ===========================================================

    loadUser();


    // -----------------------------------------------------------
    // DEFAULT TAB = CHECK-IN
    // -----------------------------------------------------------

    showTab("check");


    // -----------------------------------------------------------
    // LOAD STATUS IN BACKGROUND
    // -----------------------------------------------------------

    loadLatestStatus();


    // -----------------------------------------------------------
    // LOAD HISTORY
    // -----------------------------------------------------------

    loadHistory();

});