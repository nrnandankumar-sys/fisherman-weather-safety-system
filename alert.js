async function getAlerts(){

    const city =
    document.getElementById("city").value;


    
    if(city===""){

        alert("Enter City Name");

        return;

    }


    
    try{

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=00635e07f8b20b8f0d5335fc43245700&units=metric`);

        const data = await response.json();

        console.log(data);


        // Weather Data

        const temp =
        data.main.temp;

        const wind =
        data.wind.speed;

        const weather =
        data.weather[0].main;


        // Display Values

        document.getElementById("temp").innerHTML =
        temp + " °C";

        document.getElementById("wind").innerHTML =
        wind + " km/h";

        document.getElementById("weather").innerHTML =
        weather;


        // Alert Conditions

        if(wind > 20){

            document.getElementById("alertTitle")
            .innerHTML =
            "⚠ High Wind Warning";

            document.getElementById("alertMessage")
            .innerHTML =
            "Sea travel is dangerous for fishermen.";

        }

        else if(weather === "Rain"){

            document.getElementById("alertTitle")
            .innerHTML =
            "🌧 Heavy Rain Alert";

            document.getElementById("alertMessage")
            .innerHTML =
            "Avoid deep sea fishing today.";

        }

        else{

            document.getElementById("alertTitle")
            .innerHTML =
            "✅ Sea Condition Safe";

            document.getElementById("alertMessage")
            .innerHTML =
            "Weather conditions are normal.";

        }

    }

    catch(error){

        console.log(error);

        alert("Alert Data Failed");

    }

}
const menu=document.getElementById("menuIcon");
const nav=document.getElementById("navLinks");

menu.onclick=function(){
nav.classList.toggle("active");
};
