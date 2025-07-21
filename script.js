
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = false;
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const transcriptBox = document.getElementById("transcript");
const scoreBox = document.getElementById("score");

micButton.addEventListener("click", () => {
  transcriptBox.textContent = "";
  scoreBox.textContent = "";
  const utterance = new SpeechSynthesisUtterance(currentSentence);
  speechSynthesis.speak(utterance);

  const chunks = [];
  const recorder = new MediaRecorder(window.stream);
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks);
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();

    audio.onended = () => {
      transcriptBox.textContent = "🧠 Đang nhận diện...";
      recognition.start();
    };
  };
  recorder.start();
  setTimeout(() => recorder.stop(), 1500); // ghi âm ngắn
});

recognition.onresult = event => {
  const speech = event.results[0][0].transcript.trim().toLowerCase();
  transcriptBox.textContent = speech;
  const ref = currentSentence.trim().toLowerCase();
  let score = 100;

  if (speech === ref) score = 100;
  else {
    const ratio = speech.length / ref.length;
    score = Math.round(Math.max(30, Math.min(100, ratio * 100)));
    score = Math.round(score / 10) * 10;
  }

  scoreBox.textContent = score;
};

recognition.onerror = e => {
  transcriptBox.textContent = "❌ Không nhận diện được";
  scoreBox.textContent = "0";
};
