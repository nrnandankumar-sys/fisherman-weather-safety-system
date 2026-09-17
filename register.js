// ===============================================================
// SUPABASE
// ===============================================================

import { supabase } from "./supabase-config.js";


// ===============================================================
// DOM ELEMENTS
// ===============================================================

const locationBtn = document.getElementById("locationBtn");
const registerBtn = document.getElementById("registerBtn");


// ===============================================================
// LOCATION VARIABLES
// ===============================================================

let latitude = "";
let longitude = "";


// ===============================================================
// GET USER LOCATION
// ===============================================================

if (locationBtn) {
    locationBtn.addEventListener("click", function () {

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by this browser.");
            return;
        }

        locationBtn.disabled = true;
        locationBtn.innerText = "Getting Location...";

        navigator.geolocation.getCurrentPosition(
            async function (position) {

                latitude = position.coords.latitude;
                longitude = position.coords.longitude;

                try {

                    const url =
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

                    const response = await fetch(url, {
                        headers: {
                            "Accept": "application/json"
                        }
                    });

                    if (!response.ok) {
                        throw new Error("Unable to get location information.");
                    }

                    const data = await response.json();

                    const address = data.address || {};

                    const place =
                        address.village ||
                        address.town ||
                        address.city ||
                        address.municipality ||
                        address.county ||
                        address.state ||
                        "Unknown";

                    const locationInput =
                        document.getElementById("location");

                    if (locationInput) {
                        locationInput.value = place;
                    }
                } catch (error) {

                    console.error("Location Error:", error);

                    const locationInput =
                        document.getElementById("location");

                    if (locationInput) {
                        locationInput.value = "Unknown";
                    }

                    alert(
                        "GPS location found, but village/city name could not be detected."
                    );

                } finally {

                    locationBtn.disabled = false;
                    locationBtn.innerText = "Get Current Location";
                }
            },

            function (error) {

                console.error("Geolocation Error:", error);

                latitude = "";
                longitude = "";

                locationBtn.disabled = false;
                locationBtn.innerText = "Get Current Location";

                if (error.code === 1) {
                    alert("Please allow location permission.");
                }
                else if (error.code === 2) {
                    alert("Unable to determine your location.");
                }
                else if (error.code === 3) {
                    alert("Location request timed out.");
                }
                else {
                    alert("Unable to get your location.");
                }
            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    });
}


// ===============================================================
// REGISTER FISHERMAN
// ===============================================================

if (registerBtn) {

    registerBtn.addEventListener("click", async function () {

        // ---------------------------------------------------------
        // GET FORM ELEMENTS
        // ---------------------------------------------------------

        const nameElement =
            document.getElementById("name");

        const phoneElement =
            document.getElementById("phone");

        const emailElement =
            document.getElementById("email");

        const locationElement =
            document.getElementById("location");


        // ---------------------------------------------------------
        // CHECK FORM ELEMENTS
        // ---------------------------------------------------------

        if (
            !nameElement ||
            !phoneElement ||
            !emailElement ||
            !locationElement
        ) {

            alert(
                "Registration form elements not found."
            );

            return;
        }


        // ---------------------------------------------------------
        // GET VALUES
        // ---------------------------------------------------------

        const name =
            nameElement.value.trim();

        const phone =
            phoneElement.value.trim();

        const email =
            emailElement.value.trim();

        const location =
            locationElement.value.trim();


        // ---------------------------------------------------------
        // BASIC VALIDATION
        // ---------------------------------------------------------

        if (
            name === "" ||
            phone === "" ||
            email === "" ||
            location === ""
        ) {

            alert(
                "Please fill all fields."
            );

            return;
        }


        // ---------------------------------------------------------
        // PHONE VALIDATION
        // ---------------------------------------------------------

        if (!/^[0-9]{10}$/.test(phone)) {

            alert(
                "Please enter a valid 10-digit phone number."
            );

            return;
        }


        // ---------------------------------------------------------
        // EMAIL VALIDATION
        // ---------------------------------------------------------

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            alert(
                "Please enter a valid email address."
            );

            return;
        }


        // ---------------------------------------------------------
        // LOCATION CHECK
        // ---------------------------------------------------------

        if (
            latitude === "" ||
            longitude === ""
        ) {

            return;
            
        }


        // ---------------------------------------------------------
        // DISABLE REGISTER BUTTON
        // ---------------------------------------------------------

        registerBtn.disabled = true;
        registerBtn.innerText = "Registering...";


        try {

            // =====================================================
            // TEST SUPABASE CONNECTION
            // =====================================================

            console.log("Checking Supabase connection...");


            // =====================================================
            // CHECK EXISTING PHONE NUMBER
            // =====================================================

            const {
                data: existingUsers,
                error: searchError
            } = await supabase
                .from("registered_users")
                .select("id")
                .eq("phone", phone)
                .limit(1);


            if (searchError) {

                console.error(
                    "Phone Check Error:",
                    searchError
                );

                throw searchError;
            }


            // =====================================================
            // DUPLICATE PHONE
            // =====================================================

            if (
                existingUsers &&
                existingUsers.length > 0
            ) {

                alert(
                    "This phone number is already registered."
                );

                registerBtn.disabled = false;
                registerBtn.innerText = "Register";

                return;
            }


            // =====================================================
            // INSERT REGISTERED USER
            // =====================================================

            console.log(
                "Inserting user into registered_users..."
            );


            const userData = {

                name: name,

                phone: phone,

                email: email,

                location: location,

                latitude:
                    latitude === ""
                        ? null
                        : Number(latitude),

                longitude:
                    longitude === ""
                        ? null
                        : Number(longitude),

                created_at:
                    new Date().toISOString()
            };


            console.log(
                "Data being inserted:",
                userData
            );


            const {
                data: newUser,
                error: insertError
            } = await supabase
                .from("registered_users")
                .insert([userData])
                .select()
                .single();


            // =====================================================
            // INSERT ERROR
            // =====================================================

            if (insertError) {

                console.error(
                    "Supabase Insert Error:",
                    insertError
                );

                throw insertError;
            }


            // =====================================================
            // CHECK INSERTED USER
            // =====================================================

            console.log(
                "Registration successful:",
                newUser
            );


            // =====================================================
            // SAVE REGISTRATION STATUS
            // =====================================================

            localStorage.setItem(
                "isRegistered",
                "true"
            );


            // =====================================================
            // CURRENT USER
            // =====================================================

            let currentUser = {};

            try {

                currentUser =
                    JSON.parse(
                        localStorage.getItem("currentUser")
                    ) || {};

            } catch (error) {

                currentUser = {};
            }


            currentUser.id =
                newUser.id;

            currentUser.name =
                name;

            currentUser.phone =
                phone;

            currentUser.email =
                email;

            currentUser.location =
                location;

            currentUser.latitude =
                latitude === ""
                    ? null
                    : Number(latitude);

            currentUser.longitude =
                longitude === ""
                    ? null
                    : Number(longitude);


            // =====================================================
            // SAVE CURRENT USER
            // =====================================================

            localStorage.setItem(
                "currentUser",
                JSON.stringify(currentUser)
            );

            localStorage.setItem(
                "user_id",
                String(newUser.id)
            );

            localStorage.setItem(
                "user_name",
                name
            );

            localStorage.setItem(
                "user_phone",
                phone
            );

            localStorage.setItem(
                "isLoggedIn",
                "true"
            );


            if (latitude !== "") {

                localStorage.setItem(
                    "user_latitude",
                    String(latitude)
                );
            }

            if (longitude !== "") {

                localStorage.setItem(
                    "user_longitude",
                    String(longitude)
                );
            }

            localStorage.setItem(
                "user_location",
                location
            );


            // =====================================================
            // SUCCESS
            // =====================================================

            alert(
                "Registration Successful!"
            );


            window.location.href =
                "main.html";
        }


        // =========================================================
        // ERROR HANDLING
        // =========================================================

        catch (error) {

            console.error(
                "================================="
            );

            console.error(
                "SUPABASE REGISTRATION ERROR"
            );

            console.error(
                "================================="
            );

            console.error(
                "Error:",
                error
            );

            console.error(
                "Message:",
                error?.message
            );

            console.error(
                "Code:",
                error?.code
            );

            console.error(
                "Details:",
                error?.details
            );

            console.error(
                "Hint:",
                error?.hint
            );


            // Show the REAL error
            alert(
                "Supabase Registration Error\n\n" +
                "Code: " +
                (error?.code || "N/A") +
                "\n\n" +
                "Message: " +
                (error?.message || "Unknown error") +
                "\n\n" +
                "Check F12 → Console for details."
            );


            registerBtn.disabled = false;
            registerBtn.innerText = "Register";
        }

    });
}