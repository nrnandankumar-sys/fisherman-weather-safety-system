// ===============================================================
// SUPABASE IMPORT
// ===============================================================

import { supabase } from "./supabase-config.js";


// ===============================================================
// ADMIN AUTHENTICATION CHECK
// ===============================================================

async function checkAdminLogin() {

    const {
        data: { session },
        error
    } = await supabase.auth.getSession();

    if (error) {
        console.error("AUTH CHECK ERROR:", error);
        window.location.href = "admin_login.html";
        return false;
    }

    if (!session) {
        window.location.href = "admin_login.html";
        return false;
    }

    return true;
}


// ===============================================================
// DOM ELEMENTS
// ===============================================================

const alertTable =
    document.getElementById("alertTable");

const userTable =
    document.getElementById("userTable");

const alertTab =
    document.getElementById("alertTab");

const userTab =
    document.getElementById("userTab");

const alertSection =
    document.getElementById("alertSection");

const userSection =
    document.getElementById("userSection");


// ===============================================================
// TAB MANAGEMENT
// ===============================================================

if (alertTab) {

    alertTab.addEventListener("click", function () {

        if (alertSection) {
            alertSection.style.display = "block";
        }

        if (userSection) {
            userSection.style.display = "none";
        }

        alertTab.classList.add("active");

        if (userTab) {
            userTab.classList.remove("active");
        }

    });

}


if (userTab) {

    userTab.addEventListener("click", function () {

        if (alertSection) {
            alertSection.style.display = "none";
        }

        if (userSection) {
            userSection.style.display = "block";
        }

        userTab.classList.add("active");

        if (alertTab) {
            alertTab.classList.remove("active");
        }

    });

}


// ===============================================================
// FORMAT DATE / TIME
// ===============================================================

function formatTimestamp(timestamp) {

    if (!timestamp) {
        return "-";
    }

    try {

        const date = new Date(timestamp);

        if (!isNaN(date.getTime())) {

            return date.toLocaleString();

        }

    }
    catch (error) {

        console.error(
            "Timestamp formatting error:",
            error
        );

    }

    return "-";
}


// ===============================================================
// DATE VALUE FOR SORTING
// ===============================================================

function getDateValue(value) {

    if (!value) {
        return 0;
    }

    try {

        const date = new Date(value);

        if (!isNaN(date.getTime())) {
            return date.getTime();
        }

    }
    catch (error) {

        console.error(
            "Date conversion error:",
            error
        );

    }

    return 0;
}


// ===============================================================
// ESCAPE HTML
// ===============================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ===============================================================
// LOAD EMERGENCY ALERTS
// ===============================================================

async function loadAlerts() {

    if (!alertTable) {
        return;
    }

    alertTable.innerHTML = `
        <tr>
            <td colspan="8">
                Loading emergency alerts...
            </td>
        </tr>
    `;

    try {

        const {
            data: alerts,
            error
        } = await supabase
            .from("emergency_alerts")
            .select("*")
            .order("created_at", {
                ascending: false
            });


        if (error) {
            throw error;
        }


        alertTable.innerHTML = "";


        if (!alerts || alerts.length === 0) {

            alertTable.innerHTML = `
                <tr>
                    <td colspan="8">
                        No emergency alerts available
                    </td>
                </tr>
            `;

            return;
        }


        alerts.forEach(alert => {

            const row =
                document.createElement("tr");


            const status =
                alert.status ||
                "Emergency Requested";


            const alertTime =
                alert.time ||
                alert.created_at ||
                "-";


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        alert.name || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        alert.phone || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        alert.location || "-"
                    )}
                </td>

                <td>
                    ${alert.latitude ?? "-"}
                </td>

                <td>
                    ${alert.longitude ?? "-"}
                </td>

                <td>
                    ${escapeHTML(
                        formatTimestamp(alertTime)
                    )}
                </td>

                <td>

                    <select
                        class="status-select"
                        data-id="${alert.id}"
                    >

                        <option
                            value="Emergency Requested"
                            ${status === "Emergency Requested"
                                ? "selected"
                                : ""}
                        >
                            Emergency Requested
                        </option>

                        <option
                            value="Under Review"
                            ${status === "Under Review"
                                ? "selected"
                                : ""}
                        >
                            Under Review
                        </option>

                        <option
                            value="Rescue in Progress"
                            ${status === "Rescue in Progress"
                                ? "selected"
                                : ""}
                        >
                            Rescue in Progress
                        </option>

                        <option
                            value="Safe to Return"
                            ${status === "Safe to Return"
                                ? "selected"
                                : ""}
                        >
                            Safe to Return
                        </option>

                        <option
                            value="Resolved"
                            ${status === "Resolved"
                                ? "selected"
                                : ""}
                        >
                            Resolved
                        </option>

                    </select>

                </td>

                <td>

                    <button
                        class="delete-btn delete-alert-btn"
                        data-id="${alert.id}"
                    >
                        Delete
                    </button>

                </td>

            `;


            alertTable.appendChild(row);

        });


        // STATUS CHANGE EVENTS

        document
            .querySelectorAll(".status-select")
            .forEach(select => {

                select.addEventListener(
                    "change",
                    function () {

                        changeStatus(
                            this.dataset.id,
                            this.value
                        );

                    }
                );

            });


        // DELETE ALERT EVENTS

        document
            .querySelectorAll(".delete-alert-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        deleteAlert(
                            this.dataset.id
                        );

                    }
                );

            });

    }
    catch (error) {

        console.error(
            "LOAD ALERTS ERROR:",
            error
        );

        alertTable.innerHTML = `
            <tr>
                <td colspan="8">
                    Error loading emergency alerts.
                    <br>
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;

    }

}


// ===============================================================
// LOAD REGISTERED FISHERMEN
// ===============================================================

async function loadUsers() {

    if (!userTable) {
        return;
    }

    userTable.innerHTML = `
        <tr>
            <td colspan="8">
                Loading registered fishermen...
            </td>
        </tr>
    `;

    try {

        /*
         * This uses the "users" table.
         *
         * If your register.js stores users in
         * "registered_users", change:
         *
         * .from("users")
         *
         * to:
         *
         * .from("registered_users")
         */

        const {
            data: users,
            error
        } = await supabase
            .from("users")
            .select("*")
            .order("created_at", {
                ascending: false
            });


        if (error) {
            throw error;
        }


        userTable.innerHTML = "";


        if (!users || users.length === 0) {

            userTable.innerHTML = `
                <tr>
                    <td colspan="8">
                        No registered fishermen available
                    </td>
                </tr>
            `;

            return;
        }


        users.forEach(user => {

            const registeredDate =
                formatTimestamp(
                    user.created_at
                );


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        user.name || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        user.phone || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        user.email || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        user.location || "-"
                    )}
                </td>

                <td>
                    ${user.latitude ?? "-"}
                </td>

                <td>
                    ${user.longitude ?? "-"}
                </td>

                <td>
                    ${escapeHTML(
                        registeredDate
                    )}
                </td>

                <td>

                    <button
                        class="delete-btn delete-user-btn"
                        data-id="${user.id}"
                    >
                        Delete
                    </button>

                </td>

            `;


            userTable.appendChild(row);

        });


        // DELETE USER EVENTS

        document
            .querySelectorAll(".delete-user-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        deleteUser(
                            this.dataset.id
                        );

                    }
                );

            });

    }
    catch (error) {

        console.error(
            "LOAD USERS ERROR:",
            error
        );

        userTable.innerHTML = `
            <tr>
                <td colspan="8">
                    Error loading registered fishermen.
                    <br>
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;

    }

}


// ===============================================================
// UPDATE EMERGENCY STATUS
// ===============================================================

async function changeStatus(id, status) {

    try {

        const {
            error
        } = await supabase
            .from("emergency_alerts")
            .update({
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq("id", id);


        if (error) {
            throw error;
        }


        alert(
            "Status Updated Successfully"
        );


        await loadAlerts();

    }
    catch (error) {

        console.error(
            "STATUS UPDATE ERROR:",
            error
        );

        alert(
            "Unable to update emergency status.\n\n" +
            error.message
        );

    }

}


// ===============================================================
// DELETE EMERGENCY ALERT
// ===============================================================

async function deleteAlert(id) {

    if (
        !confirm(
            "Delete this emergency alert?"
        )
    ) {

        return;

    }


    try {

        const {
            error
        } = await supabase
            .from("emergency_alerts")
            .delete()
            .eq("id", id);


        if (error) {
            throw error;
        }


        alert(
            "Alert Deleted Successfully"
        );


        await loadAlerts();

    }
    catch (error) {

        console.error(
            "DELETE ALERT ERROR:",
            error
        );

        alert(
            "Unable to delete emergency alert.\n\n" +
            error.message
        );

    }

}


// ===============================================================
// DELETE REGISTERED FISHERMAN
// ===============================================================

async function deleteUser(id) {

    if (
        !confirm(
            "Delete this registered fisherman?"
        )
    ) {

        return;

    }


    try {

        const {
            error
        } = await supabase
            .from("users")
            .delete()
            .eq("id", id);


        if (error) {
            throw error;
        }


        alert(
            "User Deleted Successfully"
        );


        await loadUsers();

    }
    catch (error) {

        console.error(
            "DELETE USER ERROR:",
            error
        );

        alert(
            "Unable to delete registered fisherman.\n\n" +
            error.message
        );

    }

}


// ===============================================================
// ADMIN LOGOUT
// ===============================================================

window.logout = async function () {

    try {

        await supabase.auth.signOut();

    }
    catch (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );

    }

    localStorage.removeItem("admin");
    localStorage.removeItem("admin_email");

    window.location.href =
        "admin_login.html";

};


// ===============================================================
// INITIAL LOAD
// ===============================================================

async function initializeAdminDashboard() {

    const loggedIn =
        await checkAdminLogin();

    if (!loggedIn) {
        return;
    }

    await loadAlerts();

    await loadUsers();

}


initializeAdminDashboard();