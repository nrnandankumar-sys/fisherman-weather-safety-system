const messages={

en:"⚠ Cyclone Warning. Heavy rain and strong winds are expected. Avoid sea travel until further notice.",

te:"⚠ తుఫాను హెచ్చరిక. భారీ వర్షాలు మరియు బలమైన గాలులు వీచే అవకాశం ఉంది. తదుపరి సమాచారం వచ్చే వరకు సముద్ర ప్రయాణం చేయవద్దు.",

kn:"⚠ ಚಂಡಮಾರುತ ಎಚ್ಚರಿಕೆ. ಭಾರಿ ಮಳೆ ಮತ್ತು ಬಲವಾದ ಗಾಳಿಯ ಸಾಧ್ಯತೆ ಇದೆ. ಮುಂದಿನ ಸೂಚನೆ ಬರುವವರೆಗೆ ಸಮುದ್ರಕ್ಕೆ ಹೋಗಬೇಡಿ.",

ta:"⚠ புயல் எச்சரிக்கை. கனமழை மற்றும் பலத்த காற்று வீசும் வாய்ப்பு உள்ளது. அடுத்த அறிவிப்பு வரும் வரை கடலுக்கு செல்ல வேண்டாம்.",

ml:"⚠ ചുഴലിക്കാറ്റ് മുന്നറിയിപ്പ്. ശക്തമായ മഴയും കാറ്റും പ്രതീക്ഷിക്കുന്നു. അടുത്ത അറിയിപ്പ് വരുന്നത് വരെ കടലിൽ പോകരുത്.",

hi:"⚠ चक्रवात चेतावनी। भारी वर्षा और तेज़ हवाओं की संभावना है। अगले आदेश तक समुद्र में न जाएँ।"

};
const safeMessages = {
    en: "✅ Safe to go fishing. Weather conditions are normal.",
    
    ta: "✅ கடலுக்குச் செல்ல பாதுகாப்பானது. வானிலை நிலைமை இயல்பாக உள்ளது.",
    
    kn: "✅ ಮೀನುಗಾರಿಕೆಗೆ ಹೋಗುವುದು ಸುರಕ್ಷಿತವಾಗಿದೆ. ಹವಾಮಾನ ಸಾಮಾನ್ಯವಾಗಿದೆ.",
    
    te: "✅ చేపల వేటకు వెళ్లడం సురక్షితం. వాతావరణ పరిస్థితులు సాధారణంగా ఉన్నాయి.",
    
    hi: "✅ मछली पकड़ने जाना सुरक्षित है। मौसम की स्थिति सामान्य है।",
    
    ml: "✅ മത്സ്യബന്ധനത്തിന് പോകുന്നത് സുരക്ഷിതമാണ്. കാലാവസ്ഥ സാധാരണ നിലയിലാണ്."
};
async function changeLanguage(){
    const cityName = "pulivendula";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=00635e07f8b20b8f0d5335fc43245700&units=metric`);

    const data = await response.json();
    console.log(data);
    windSpeed = data.wind.speed;
    if (windSpeed > 15) {
        const lang=document.getElementById("language").value;
        document.getElementById("message").innerHTML=messages[lang];
        document.getElementById("message").style.color="red";
    }
    else{
        const lang=document.getElementById("language").value;
        document.getElementById("message").innerHTML=safeMessages[lang];
        document.getElementById("message").style.color="green";
    }
}

changeLanguage();

const today=new Date();

document.getElementById("date").innerHTML=
today.toLocaleDateString("en-IN");

document.getElementById("time").innerHTML=
today.toLocaleTimeString("en-IN");

const menu=document.getElementById("menuIcon");
const nav=document.getElementById("navLinks");

menu.onclick=function(){
nav.classList.toggle("active");
};