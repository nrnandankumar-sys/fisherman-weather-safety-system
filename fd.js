const API_KEY = "00635e07f8b20b8f0d5335fc43245700";

async function loadForecast() {

    const forecast = document.getElementById("forecast");

    if (!forecast) {
        return;
    }

    forecast.innerHTML = `
        <h3>Getting your location...</h3>
    `;

    if (!navigator.geolocation) {

        forecast.innerHTML = `
            <h3>Geolocation is not supported by your browser.</h3>
        `;

        return;
    }

    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);

            forecast.innerHTML = `
                <h3>Loading weather...</h3>
            `;

            try {

                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                );

                if (!response.ok) {
                    throw new Error(
                        `Weather API error: ${response.status}`
                    );
                }

                const data = await response.json();

                console.log("Weather Data:", data);

                forecast.innerHTML = "";

                const fiveDays = data.list.filter(item =>
                    item.dt_txt.includes("12:00:00")
                );

                fiveDays.forEach(day => {

                    const date = new Date(day.dt_txt);

                    const options = {
                        weekday: "short"
                    };

                    const dayName =
                        date.toLocaleDateString(
                            "en-US",
                            options
                        );

                    forecast.innerHTML += `

                        <div
                            class="card"
                            style="
                                display:flex;
                                flex-direction:column;
                                align-items:center;
                                justify-content:center;
                                padding:10px;
                                border:1px solid #ccc;
                                border-radius:10px;
                            "
                        >

                            <h3>
                                ${dayName}
                            </h3>

                            <p>
                                ${day.main.temp} °C
                            </p>

                            <p>
                                ${day.weather[0].main}
                            </p>

                            <p>
                                ${day.weather[0].description}
                            </p>

                            <p>
                                Humidity:
                                ${day.main.humidity}%
                            </p>

                            <p>
                                Wind:
                                ${day.wind.speed} m/s
                            </p>

                        </div>

                    `;
                });

                if (fiveDays.length === 0) {

                    forecast.innerHTML = `
                        <h3>
                            Forecast data is not available.
                        </h3>
                    `;
                }

            }

            catch (error) {

                console.error(
                    "Weather Error:",
                    error
                );

                forecast.innerHTML = `
                    <h3>
                        Unable to load forecast.
                    </h3>
                    <p>
                        ${error.message}
                    </p>
                `;
            }

        },

        function(error) {

            console.error(
                "Location Error:",
                error
            );

            let message =
                "Unable to get your location.";

            if (error.code === 1) {
                message =
                    "Location permission was denied. Please allow location access.";
            }

            else if (error.code === 2) {
                message =
                    "Your location could not be determined.";
            }

            else if (error.code === 3) {
                message =
                    "Location request timed out.";
            }

            forecast.innerHTML = `
                <h3>
                    ${message}
                </h3>
            `;
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );
}

loadForecast();