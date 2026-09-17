// ===============================================================
// SUPABASE
// ===============================================================

import { supabase } from "./supabase-config.js";


// ===============================================================
// ADMIN LOGIN
// ===============================================================

async function adminLogin() {

    const userInput =
        document.getElementById("username");

    const passInput =
        document.getElementById("password");


    if (!userInput || !passInput) {

        alert(
            "Username or password field not found."
        );

        return;
    }


    const username =
        userInput.value.trim();

    const password =
        passInput.value.trim();


    // -------------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------------

    if (!username || !password) {

        alert(
            "Please enter username and password."
        );

        return;
    }


    // -------------------------------------------------------------
    // CHECK USERNAME
    // -------------------------------------------------------------

    if (username !== "admin") {

        alert(
            "Invalid Username or Password"
        );

        return;
    }


    // -------------------------------------------------------------
    // DISABLE LOGIN BUTTON
    // -------------------------------------------------------------

    const loginButton =
        document.querySelector(
            'button[type="submit"], button[type="button"]'
        );

    if (loginButton) {

        loginButton.disabled = true;
        loginButton.innerText = "Logging in...";

    }


    // -------------------------------------------------------------
    // SUPABASE AUTH LOGIN
    // -------------------------------------------------------------

    try {

        console.log(
            "Attempting Admin Login..."
        );


        const {
            data,
            error
        } = await supabase.auth.signInWithPassword({

            email:
                "admin@fisherman.com",

            password:
                password

        });


        // ---------------------------------------------------------
        // AUTH ERROR
        // ---------------------------------------------------------

        if (error) {

            console.error(
                "SUPABASE ADMIN LOGIN ERROR:",
                error
            );

            console.error(
                "Code:",
                error.code
            );

            console.error(
                "Message:",
                error.message
            );

            console.error(
                "Status:",
                error.status
            );


            alert(
                "Admin Login Failed\n\n" +
                "Code: " +
                (error.code || "N/A") +
                "\n\nMessage: " +
                (error.message || "Unknown error")
            );


            if (loginButton) {

                loginButton.disabled = false;
                loginButton.innerText = "Login";

            }

            return;
        }


        // ---------------------------------------------------------
        // CHECK USER
        // ---------------------------------------------------------

        if (!data || !data.user) {

            alert(
                "Login failed. Admin user was not returned."
            );


            if (loginButton) {

                loginButton.disabled = false;
                loginButton.innerText = "Login";

            }

            return;
        }


        // ---------------------------------------------------------
        // LOGIN SUCCESS
        // ---------------------------------------------------------

        console.log(
            "Admin Login Successful:",
            data.user
        );


        localStorage.setItem(
            "admin",
            "true"
        );


        localStorage.setItem(
            "admin_email",
            data.user.email || "admin@fisherman.com"
        );


        localStorage.setItem(
            "admin_user_id",
            data.user.id
        );


        alert(
            "Admin Login Successful!"
        );


        window.location.href =
            "admin_dashboard.html";

    }

    catch (error) {

        console.error(
            "ADMIN LOGIN EXCEPTION:",
            error
        );


        alert(
            "Admin Login Error\n\n" +
            (error.message || "Unknown error")
        );


        if (loginButton) {

            loginButton.disabled = false;
            loginButton.innerText = "Login";

        }

    }

}


// ===============================================================
// FORM SUBMIT
// ===============================================================

const form =
    document.getElementById(
        "adminLoginForm"
    );


if (form) {

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            adminLogin();

        }
    );

}

window.adminLogin =
    adminLogin;