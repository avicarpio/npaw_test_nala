const userBtn = document.getElementById("userBtn");
const nalaBtn = document.getElementById("nalaBtn");

const speechText = document.getElementById("user");
const nalaText = document.getElementById("nala");

const languageSelector = document.getElementById("languageSelector");

const speech = new SpeechSynthesisUtterance();

speechText.textContent = "";

let recognitionEnabled = true;
let text2speechEnabled = true;

let ttlSpeech = false;

let recognition = new webkitSpeechRecognition();

recognition.lang = languageSelector.value;
recognition.continous = true;
recognition.interimResults = false;

recognition.start();

userBtn.setAttribute("class", "enabled");
nalaBtn.setAttribute("class", "enabled");

languageSelector.addEventListener("change", () => {
  console.log("New lang selected: " + languageSelector.value);
  recognition.lang = languageSelector.value;

  recognition.stop();

  // Give a bit delay and then start again with the same instance
  setTimeout(function () {
    recognition.start();
  }, 400);
});

userBtn.addEventListener("click", () => {
  recognitionEnabled = !recognitionEnabled;
  if (recognitionEnabled) {
    recognition.start();
    userBtn.setAttribute("class", "enabled");
  } else {
    recognition.stop();
    userBtn.removeAttribute("class", "enabled");
  }
});

nalaBtn.addEventListener("click", () => {
  text2speechEnabled = !text2speechEnabled;
  if (text2speechEnabled) {
    nalaBtn.setAttribute("class", "enabled");
  } else {
    nalaBtn.removeAttribute("class", "enabled");
  }
});

recognition.onresult = (event) => {
  const results = event.results;
  console.log(results);
  const newText = results[results.length - 1][0].transcript;
  speechText.textContent += newText + "\n";
  fetchAsync(
    "http://ai1.npaw.com:8000/nala?query=" + newText + "?&module=sql"
  ).then((naLaResponse) => {
    console.log(naLaResponse);
    nalaText.textContent += naLaResponse.extra.text + "\n";
    if (text2speechEnabled) {
      text2speech(naLaResponse.extra.text);
    } else {
      ttlSpeech = false;
      if (recognitionEnabled) {
        recognition.start();
      }
    }
  });
};

recognition.onerror = (event) => {
  console.log("Error: " + event.error);
};

recognition.onend = (event) => {
  console.log("Stopped mic, reinit");
  ttlSpeech = true;
};

function text2speech(text) {
  console.log("naLa Talking: " + text);
  speech.text = text;
  speech.volume = 1;
  speech.rate = 1;
  speech.pitch = 1;
  speech.lang = languageSelector.value;

  window.speechSynthesis.speak(speech);

  // In case of some error (browser related) ignore speech.
  setTimeout(() => {
    if(!window.speechSynthesis.speaking){
        if (recognitionEnabled) {
            recognition.start();
          }
    }
  }, 500);
}

speech.onerror = function (error) {
  console.log("Speech error: " + error);
};

speech.onend = function () {
  ttlSpeech = false;
  if (recognitionEnabled) {
    recognition.start();
  }
};

async function fetchAsync(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}
