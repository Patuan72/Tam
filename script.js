
import initVosk, { Model, KaldiRecognizer } from "https://cdn.jsdelivr.net/gh/alphacep/vosk-browser/dist/worker.js";

let recognizer;
let modelReady = false;
let currentSentence = "";
let currentRate = 1.0;
let audioBlob = null;
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

const micBtn = document.getElementById("mic");
const replayBtn = document.getElementById("replay");
const saveBtn = document.getElementById("save");
const transcriptBox = document.getElementById("transcript");
const scoreBox = document.querySelector(".score");
const sentenceList = document.getElementById("sentenceList");
const menuBtn = document.getElementById("menuBtn");
const libraryPanel = document.getElementById("library");
const backBtn = document.getElementById("backBtn");

function clean(text) {
  return text.toLowerCase().replace(/[.,!?]/g, "").trim();
}
function compareSentences(expected, actual) {
  const expectedWords = clean(expected).split(" ");
  const actualWords = clean(actual).split(" ");
  let match = 0;
  expectedWords.forEach((word, i) => {
    if (actualWords[i] && actualWords[i] === word) match++;
  });
  return Math.round((match / expectedWords.length) * 100);
}

menuBtn.addEventListener("click", () => {
  libraryPanel.classList.remove("hidden");
});
backBtn.addEventListener("click", () => {
  libraryPanel.classList.add("hidden");
});
document.querySelectorAll(".dot").forEach((dot, index) => {
  dot.addEventListener("click", () => {
    document.querySelectorAll(".dot").forEach(d => d.classList.remove("selected"));
    dot.classList.add("selected");
    currentRate = [0.6, 1.0, 1.4][index];
  });
});
document.querySelectorAll("#downloadedList a").forEach(link => {
  link.addEventListener("click", async e => {
    e.preventDefault();
    const res = await fetch(link.dataset.unit);
    const data = await res.json();
    sentenceList.innerHTML = "";
    data.sentences.forEach((sentence, i) => {
      const div = document.createElement("div");
      div.textContent = (i + 1) + ". " + sentence;
      div.className = "sentence-item";
      div.addEventListener("click", () => {
        currentSentence = sentence;
        speakSentence(sentence);
      });
      sentenceList.appendChild(div);
    });
    libraryPanel.classList.add("hidden");
  });
});

function speakSentence(sentence) {
  const utterance = new SpeechSynthesisUtterance(sentence);
  utterance.lang = "en-US";
  utterance.rate = currentRate;
  speechSynthesis.speak(utterance);
}

micBtn.addEventListener("click", async () => {
  if (!modelReady) return alert("Model chưa sẵn sàng. Vui lòng đợi...");
  if (!currentSentence) return alert("Hãy chọn một câu trước khi ghi âm.");
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];
  transcriptBox.textContent = "🎙 Đang ghi âm...";

  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) audioChunks.push(e.data);
  };

  mediaRecorder.onstop = async () => {
    audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    stream.getTracks().forEach(track => track.stop());
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();

    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const monoData = audioBuffer.getChannelData(0);

    recognizer.acceptWaveform(monoData);
    const result = recognizer.result();
    const transcript = result.text || "(no result)";
    transcriptBox.textContent = "🗣 " + transcript;
    const score = compareSentences(currentSentence, transcript);
    scoreBox.textContent = score;
  };

  mediaRecorder.start();
  setTimeout(() => {
    mediaRecorder.stop();
  }, 3000);
});

replayBtn.addEventListener("click", () => {
  if (!audioBlob) return alert("Chưa có bản ghi.");
  const audio = new Audio(URL.createObjectURL(audioBlob));
  audio.play();
});
saveBtn.addEventListener("click", () => {
  if (!audioBlob) return alert("Chưa có bản ghi để lưu.");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(audioBlob);
  a.download = "recording.webm";
  a.click();
});

(async () => {
  const vosk = await initVosk();
  const model = new vosk.Model("https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip");
  await model.init();
  recognizer = new vosk.KaldiRecognizer(model, 16000);
  modelReady = true;
})();
