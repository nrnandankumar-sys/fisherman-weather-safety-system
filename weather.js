async function searchWeather(){
    const cityName =document.getElementById("city").value;


        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=00635e07f8b20b8f0d5335fc43245700&units=metric`);

        const data = await response.json();

        console.log(data);

        document.getElementById("location")
        .innerHTML = data.name || "N/A";

        document.getElementById("temp")
        .innerHTML =
        (data.main.temp || "N/A")
        + " °C";

        document.getElementById("weather")
        .innerHTML =
        data.weather[0].description || "Cloudy";

        document.getElementById("wind")
        .innerHTML =
        (data.wind.speed || "N/A")
        + " km/h";

        document.getElementById("humidity")
        .innerHTML =
        (data.main.humidity || "N/A")
        + " %";

        
}
const menu=document.getElementById("menuIcon");
const nav=document.getElementById("navLinks");

menu.onclick=function(){
nav.classList.toggle("active");
};
