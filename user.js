// ===============================================================
// SUPABASE
// ===============================================================

import { supabase } from "./supabase-config.js";


// ===============================================================
// CURRENT USER
// ===============================================================

let user = null;

try {
    user =
        JSON.parse(
            localStorage.getItem("currentUser")
        );
} catch (error) {
    console.error("Current User Error:", error);
    user = null;
}

const guestMode =
    localStorage.getItem("guestMode");


// ===============================================================
// LOGIN / GUEST CHECK
// ===============================================================

if (!user && guestMode !== "true") {

    window.location.href = "index.html";

}


// ===============================================================
// WELCOME MESSAGE
// ===============================================================

const welcome =
    document.getElementById("welcome");

if (welcome) {

    if (user) {

        welcome.innerHTML =
            "Welcome " + (user.name || "User");

    } else {

        welcome.innerHTML =
            "Welcome Guest";

    }

}


// ===============================================================
// GET CURRENT LOCATION
// ===============================================================

if (user && navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;

            try {

                const url =
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

                const response =
                    await fetch(url, {
                        headers: {
                            "Accept": "application/json"
                        }
                    });

                if (!response.ok) {

                    throw new Error(
                        "Unable to get location"
                    );

                }

                const data =
                    await response.json();

                const location =

                    data.address?.village ||

                    data.address?.town ||

                    data.address?.city ||

                    data.address?.municipality ||

                    data.address?.county ||

                    data.address?.state ||

                    "Unknown";


                // ------------------------------------------------
                // UPDATE USER LOCATION
                // ------------------------------------------------

                user.latitude =
                    lat;

                user.longitude =
                    lon;

                user.location =
                    location;


                // ------------------------------------------------
                // SAVE USER
                // ------------------------------------------------

                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(user)
                );

                localStorage.setItem(
                    "user_latitude",
                    String(lat)
                );

                localStorage.setItem(
                    "user_longitude",
                    String(lon)
                );

                localStorage.setItem(
                    "user_location",
                    location
                );


                console.log(
                    "Current Location:",
                    location,
                    lat,
                    lon
                );

            } catch (error) {

                console.error(
                    "Location Error:",
                    error
                );

            }

        },

        function (error) {

            console.error(
                "Geolocation Error:",
                error
            );

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );

} else if (user) {

    console.error(
        "Geolocation is not supported."
    );

}


// ===============================================================
// SOS BUTTON
// ===============================================================

const sosButton =
    document.getElementById("sos");


if (sosButton) {

    sosButton.onclick = async function () {

        // ---------------------------------------------------------
        // CHECK USER
        // ---------------------------------------------------------

        if (!user) {

            alert(
                "Please login to use SOS."
            );

            return;

        }


        // ---------------------------------------------------------
        // CHECK GEOLOCATION
        // ---------------------------------------------------------

        if (!navigator.geolocation) {

            alert(
                "Geolocation is not supported by this browser."
            );

            return;

        }


        const statusText =
            document.getElementById("statusText");


        // ---------------------------------------------------------
        // DISABLE BUTTON
        // ---------------------------------------------------------

        sosButton.disabled = true;

        sosButton.innerHTML =
            "Sending SOS...";


        // ---------------------------------------------------------
        // GET LIVE LOCATION
        // ---------------------------------------------------------

        navigator.geolocation.getCurrentPosition(

            async function (position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                let location =
                    "Unknown";


                // -------------------------------------------------
                // REVERSE GEOCODING
                // -------------------------------------------------

                try {

                    const url =
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

                    const response =
                        await fetch(url, {
                            headers: {
                                "Accept": "application/json"
                            }
                        });

                    if (!response.ok) {

                        throw new Error(
                            "Unable to get location"
                        );

                    }

                    const data =
                        await response.json();


                    location =

                        data.address?.village ||

                        data.address?.town ||

                        data.address?.city ||

                        data.address?.municipality ||

                        data.address?.county ||

                        data.address?.state ||

                        data.display_name ||

                        "Unknown";


                } catch (error) {

                    console.error(
                        "Reverse Geocoding Error:",
                        error
                    );

                    location =
                        user.location ||
                        "Unknown";

                }


                // -------------------------------------------------
                // UPDATE CURRENT USER
                // -------------------------------------------------

                user.latitude =
                    latitude;

                user.longitude =
                    longitude;

                user.location =
                    location;


                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(user)
                );

                localStorage.setItem(
                    "user_latitude",
                    String(latitude)
                );

                localStorage.setItem(
                    "user_longitude",
                    String(longitude)
                );

                localStorage.setItem(
                    "user_location",
                    location
                );


                // -------------------------------------------------
                // FIND USER ID FROM USERS TABLE
                // -------------------------------------------------

                let databaseUserId = null;


                try {

                    if (user.phone) {

                        const {
                            data: userData,
                            error: userError
                        } = await supabase
                            .from("users")
                            .select("id")
                            .eq("phone", user.phone)
                            .limit(1)
                            .maybeSingle();


                        if (userError) {

                            console.error(
                                "User Lookup Error:",
                                userError
                            );

                        } else if (userData) {

                            databaseUserId =
                                userData.id;

                        }

                    }

                } catch (error) {

                    console.error(
                        "User ID Lookup Error:",
                        error
                    );

                }


                // -------------------------------------------------
                // SAVE SOS TO SUPABASE
                // -------------------------------------------------

                try {

                    console.log(
                        "Sending SOS..."
                    );

                    console.log(
                        "Name:",
                        user.name
                    );

                    console.log(
                        "Phone:",
                        user.phone
                    );

                    console.log(
                        "Location:",
                        location
                    );

                    console.log(
                        "Latitude:",
                        latitude
                    );

                    console.log(
                        "Longitude:",
                        longitude
                    );

                    console.log(
                        "User ID:",
                        databaseUserId
                    );


                    const emergencyData = {

                        user_id:
                            databaseUserId,

                        name:
                            user.name || "",

                        phone:
                            user.phone || "",

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
                        emergencyData
                    );


                    // IMPORTANT:
                    // Do NOT use .select().single()
                    // because anon users currently have
                    // INSERT permission but not SELECT permission.

                    const {
                        error
                    } = await supabase
                        .from("emergency_alerts")
                        .insert([
                            emergencyData
                        ]);


                    if (error) {

                        console.error(
                            "SUPABASE SOS ERROR:",
                            error
                        );

                        console.error(
                            "Error Code:",
                            error.code
                        );

                        console.error(
                            "Error Message:",
                            error.message
                        );

                        console.error(
                            "Error Details:",
                            error.details
                        );

                        console.error(
                            "Error Hint:",
                            error.hint
                        );

                        throw error;

                    }


                    // -------------------------------------------------
                    // SUCCESS
                    // -------------------------------------------------

                    console.log(
                        "SOS successfully saved to Supabase."
                    );


                    if (statusText) {

                        statusText.innerHTML =
                            "Emergency Alert Sent";

                        statusText.style.color =
                            "red";

                    }


                    alert(
                        "Emergency Alert Sent Successfully!\n\n" +
                        "Location: " + location
                    );


                } catch (error) {

                    console.error(
                        "FINAL SOS ERROR:",
                        error
                    );


                    if (statusText) {

                        statusText.innerHTML =
                            "Unable to Send Emergency Alert";

                        statusText.style.color =
                            "red";

                    }


                    alert(

                        "Unable to send Emergency Alert.\n\n" +

                        "Code: " +
                        (error?.code || "N/A") +

                        "\n\nMessage: " +

                        (error?.message ||
                        "Unknown error")

                    );

                }


                // -------------------------------------------------
                // ENABLE SOS BUTTON
                // -------------------------------------------------

                sosButton.disabled =
                    false;

                sosButton.innerHTML =
                    "SOS";

            },


            // =====================================================
            // GEOLOCATION ERROR
            // =====================================================

            function (error) {

                console.error(
                    "Geolocation Error:",
                    error
                );


                let message =
                    "Unable to fetch your current location.";


                if (error.code === 1) {

                    message =
                        "Location permission was denied.\n\nPlease allow location access and try again.";

                }

                else if (error.code === 2) {

                    message =
                        "Unable to determine your location.";

                }

                else if (error.code === 3) {

                    message =
                        "Location request timed out.";

                }


                alert(message);


                sosButton.disabled =
                    false;

                sosButton.innerHTML =
                    "SOS";

            },


            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }

        );

    };

}