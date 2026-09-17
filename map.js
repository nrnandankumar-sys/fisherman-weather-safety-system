function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation
        .getCurrentPosition(showPosition);
    }
    else{
        document.getElementById("lat")
        .innerHTML = "Not Supported";
        document.getElementById("lon")
        .innerHTML = "Not Supported";
    }
}
function showPosition(position){
    document.getElementById("lat")
    .innerHTML =
    position.coords.latitude;
    document.getElementById("lon")
    .innerHTML =
    position.coords.longitude;
}
getLocation();
function updateTime(){
    const now = new Date();
    document.getElementById("date")
    .innerHTML =
    now.toDateString();
    document.getElementById("time")
    .innerHTML =
    now.toLocaleTimeString();
}
updateTime();
setInterval(updateTime,1000);
let map = L.map('map').setView([20.5937, 78.9629], 5);
L.tileLayer(
'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
{
    attribution:
    '&copy; OpenStreetMap Contributors'
}
).addTo(map);
navigator.geolocation.getCurrentPosition(

function(position){
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    document.getElementById("lat")
    .innerHTML = lat.toFixed(6);
    document.getElementById("lon")
    .innerHTML = lon.toFixed(6);
    map.setView([lat, lon], 13);
    L.marker([lat, lon])
        .addTo(map)
        .bindPopup(
            "🚤 Fisherman Current Location"
        )
        .openPopup();
},

function(){
    alert(
      "Location permission denied."
    );
}
);
const menu=document.getElementById("menuIcon");
const nav=document.getElementById("navLinks");

menu.onclick=function(){
nav.classList.toggle("active");
};