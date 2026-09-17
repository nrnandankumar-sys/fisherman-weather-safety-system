const menuIcon = document.getElementById("menuIcon");
const navLinks = document.getElementById("navLinks");

menuIcon.onclick = function () {
    navLinks.classList.toggle("active");
};

document.querySelectorAll(".applyBtn").forEach(button => {
    button.addEventListener("click", function () {
        window.open(this.dataset.url, "_blank");
    });
});

const searchBox = document.getElementById("searchBox");

searchBox.addEventListener("keyup", function () {

    let value = this.value.toLowerCase();

    let cards = document.querySelectorAll(".card");

    cards.forEach(card => {

        let text = card.innerText.toLowerCase();

        if (text.includes(value)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });

});

const language = document.getElementById("language");

const translations = {

en:{

pageTitle:"🏛 Government Schemes for Fishermen",
search:"Search Scheme...",
benefits:"Benefits",
eligibility:"Eligibility",
apply:"Apply Now"

},

te:{

pageTitle:"🏛 మత్స్యకారుల ప్రభుత్వ పథకాలు",
search:"పథకం పేరు వెతకండి...",
benefits:"ప్రయోజనాలు",
eligibility:"అర్హత",
apply:"ఇప్పుడే దరఖాస్తు చేయండి"

},

ta:{

pageTitle:"🏛 மீனவர்களுக்கான அரசு திட்டங்கள்",
search:"திட்டத்தைத் தேடுங்கள்...",
benefits:"நன்மைகள்",
eligibility:"தகுதி",
apply:"இப்போது விண்ணப்பிக்கவும்"

},

kn:{

pageTitle:"🏛 ಮೀನುಗಾರರ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
search:"ಯೋಜನೆ ಹುಡುಕಿ...",
benefits:"ಸೌಲಭ್ಯಗಳು",
eligibility:"ಅರ್ಹತೆ",
apply:"ಈಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ"

},

ml:{

pageTitle:"🏛 മത്സ്യത്തൊഴിലാളികൾക്കുള്ള സർക്കാർ പദ്ധതികൾ",
search:"പദ്ധതി തിരയുക...",
benefits:"ആനുകൂല്യങ്ങൾ",
eligibility:"അർഹത",
apply:"ഇപ്പോൾ അപേക്ഷിക്കുക"

},

hi:{

pageTitle:"🏛 मछुआरों के लिए सरकारी योजनाएं",
search:"योजना खोजें...",
benefits:"लाभ",
eligibility:"पात्रता",
apply:"अभी आवेदन करें"

}

};

language.addEventListener("change", function () {

    const lang = translations[this.value];

    document.getElementById("pageTitle").innerText = lang.pageTitle;

    document.getElementById("searchBox").placeholder = lang.search;

    document.querySelectorAll(".benefitTitle").forEach(item => {
        item.innerText = lang.benefits;
    });

    document.querySelectorAll(".eligibilityTitle").forEach(item => {
        item.innerText = lang.eligibility;
    });

    document.querySelectorAll(".applyBtn").forEach(item => {
        item.innerText = lang.apply;
    });

});