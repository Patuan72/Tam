
const textInput = document.getElementById("textInput");
const playBtnTop = document.getElementById("playBtnTop");
const playBtnBottom = document.getElementById("playBtnBottom");
const micBtn = document.getElementById("micBtn");
const replayBtn = document.getElementById("replayBtn");
const scoreArea = document.getElementById("scoreArea");

let current = curriculum[0];
let audio = new Audio(current.audio);

textInput.value = current.text;

playBtnTop.onclick = playBtnBottom.onclick = () => {
  audio.play();
};

replayBtn.onclick = () => {
  audio.currentTime = 0;
  audio.play();
};

micBtn.onclick = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Your browser doesn't support Speech Recognition.");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const ref = current.text.toLowerCase().replace(/[^a-z ]/g, '');
    const hyp = transcript.toLowerCase().replace(/[^a-z ]/g, '');
    const refWords = ref.split(" ");
    const hypWords = hyp.split(" ");
    let match = 0;
    refWords.forEach((word, i) => {
      if (word === hypWords[i]) match++;
    });
    const score = Math.round((match / refWords.length) * 100);
    scoreArea.textContent = `Bạn đọc đúng ${score}%`;
  };

  recognition.onerror = (event) => {
    scoreArea.textContent = "Lỗi khi ghi âm: " + event.error;
  };
};
