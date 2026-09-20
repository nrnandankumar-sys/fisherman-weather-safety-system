// ===============================================================
// SUPABASE IMPORT
// ===============================================================

import { supabase } from "./supabase-config.js";


// ===============================================================
// ALREADY LOGGED IN CHECK
// ===============================================================

if (
    localStorage.getItem("isLoggedIn") === "true" ||
    localStorage.getItem("guestMode") === "true"
) {
    window.location.href = "main.html";
}


// ===============================================================
// LOCATION
// ===============================================================

async function getLocation() {

    return new Promise((resolve, reject) => {

        if (!navigator.geolocation) {

            reject("Geolocation not supported");

            return;
        }

        navigator.geolocation.getCurrentPosition(

            async (position) => {

                try {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                    );


                    if (!response.ok) {

                        throw new Error(
                            "Unable to get location information"
                        );

                    }


                    const data =
                        await response.json();


                    const address =
                        data.address || {};


                    const location =
                        address.village ||
                        address.town ||
                        address.city ||
                        address.county ||
                        address.state ||
                        "Unknown";


                    resolve({

                        latitude:
                            latitude,

                        longitude:
                            longitude,

                        location:
                            location

                    });

                }

                catch (error) {

                    reject(
                        error.message
                    );

                }

            },

            (error) => {

                console.error(
                    "Geolocation Error:",
                    error
                );


                if (error.code === 1) {

                    reject(
                        "Please enable location permission"
                    );

                }

                else if (error.code === 2) {

                    reject(
                        "Unable to determine your location"
                    );

                }

                else if (error.code === 3) {

                    reject(
                        "Location request timed out"
                    );

                }

                else {

                    reject(
                        "Unable to get your location"
                    );

                }

            },

            {

                enableHighAccuracy: true,

                timeout: 10000,

                maximumAge: 0

            }

        );

    });

}


// ===============================================================
// FISHERMAN LOGIN
// ===============================================================

async function login() {

    const nameElement =
        document.getElementById("name");

    const phoneElement =
        document.getElementById("phone");


    if (!nameElement || !phoneElement) {

        console.error(
            "Name or phone input element not found."
        );

        return;
    }


    const name =
        nameElement.value.trim();

    const phone =
        phoneElement.value.trim();


    // ===========================================================
    // VALIDATION
    // ===========================================================

    if (name === "" || phone === "") {

        alert(
            "Enter Name and Phone Number"
        );

        return;
    }


    if (!/^[0-9]{10}$/.test(phone)) {

        alert(
            "Enter a valid 10-digit phone number"
        );

        return;
    }


    try {

        // =======================================================
        // GET CURRENT LOCATION
        // =======================================================

        const userLocation =
            await getLocation();


        // =======================================================
        // FIND USER IN SUPABASE
        // =======================================================

        const {
            data: existingUsers,
            error: userSearchError
        } = await supabase
            .from("users")
            .select("*")
            .eq("phone", phone)
            .limit(1);


        if (userSearchError) {

            throw userSearchError;

        }


        let user;


        // =======================================================
        // NEW USER
        // =======================================================

        if (
            !existingUsers ||
            existingUsers.length === 0
        ) {

            const {
                data: newUser,
                error: insertError
            } = await supabase
                .from("users")
                .insert([

                    {

                        name:
                            name,

                        phone:
                            phone,

                        latitude:
                            userLocation.latitude,

                        longitude:
                            userLocation.longitude,

                        location:
                            userLocation.location

                    }

                ])
                .select()
                .single();


            if (insertError) {

                throw insertError;

            }


            user = newUser;

        }


        // =======================================================
        // EXISTING USER
        // =======================================================

        else {

            user =
                existingUsers[0];


            // Update latest location and name

            const {
                data: updatedUser,
                error: updateError
            } = await supabase
                .from("users")
                .update({

                    name:
                        name,

                    latitude:
                        userLocation.latitude,

                    longitude:
                        userLocation.longitude,

                    location:
                        userLocation.location,

                    updated_at:
                        new Date().toISOString()

                })
                .eq("id", user.id)
                .select()
                .single();


            if (updateError) {

                throw updateError;

            }


            user = updatedUser;

        }


        // =======================================================
        // REGISTERED USER CHECK
        // =======================================================

        const {
            data: registeredUsers,
            error: registeredSearchError
        } = await supabase
            .from("registered_users")
            .select("id")
            .eq("phone", phone)
            .limit(1);


        if (registeredSearchError) {

            throw registeredSearchError;

        }


        if (
            !registeredUsers ||
            registeredUsers.length === 0
        ) {

            localStorage.setItem(
                "isRegistered",
                "false"
            );

        }

        else {

            localStorage.setItem(
                "isRegistered",
                "true"
            );

        }


        // =======================================================
        // SAVE CURRENT USER
        // =======================================================

        const currentUser = {

            id:
                user.id,

            name:
                name,

            phone:
                phone,

            latitude:
                userLocation.latitude,

            longitude:
                userLocation.longitude,

            location:
                userLocation.location

        };


        localStorage.setItem(
            "currentUser",
            JSON.stringify(currentUser)
        );


        localStorage.setItem(
            "user_id",
            user.id
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


        // =======================================================
        // LOGIN SUCCESS
        // =======================================================



        window.location.href =
            "main.html";

    }

    catch (error) {

        console.error(
            "Login Error:",
            error
        );

    }

}


// ===============================================================
// LOGIN BUTTON
// ===============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const loginBtn =
            document.getElementById(
                "loginBtn"
            );


        if (!loginBtn) {

            console.error(
                "Login button not found."
            );

            return;
        }


        loginBtn.addEventListener(
            "click",
            login
        );

    }
);