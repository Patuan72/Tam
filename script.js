
let currentSentence = "";
let mediaRecorder;
let audioChunks = [];
let audioBlob = null;
let recognizer;
let modelReady = false;

const micBtn = document.getElementById("mic");
const replayBtn = document.getElementById("replay");
const saveBtn = document.getElementById("save");
const transcriptBox = document.getElementById("transcript");
const scoreBox = document.querySelector(".score");

document.querySelectorAll(".sentence-item").forEach(div => {
  div.addEventListener("click", () => {
    document.querySelectorAll(".sentence-item").forEach(d => d.classList.remove("active"));
    div.classList.add("active");
    currentSentence = div.textContent;
    const utterance = new SpeechSynthesisUtterance(currentSentence);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  });
});

micBtn.addEventListener("click", async () => {
  if (!currentSentence) return alert("Please select a sentence first.");

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) audioChunks.push(e.data);
  };

  mediaRecorder.onstop = async () => {
    audioBlob = new Blob(audioChunks, { type: "audio/webm" });
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
  }, 3000); // Record for 3 seconds
});

replayBtn.addEventListener("click", () => {
  if (!audioBlob) return alert("No recording yet.");
  const audio = new Audio(URL.createObjectURL(audioBlob));
  audio.play();
});

saveBtn.addEventListener("click", () => {
  if (!audioBlob) return alert("No recording to save.");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(audioBlob);
  a.download = "recording.webm";
  a.click();
});

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

// Load vosk model
(async () => {
  const { Model, KaldiRecognizer } = await import("https://cdn.jsdelivr.net/gh/alphacep/vosk-browser/dist/worker.js");
  const model = new Model("https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip");
  await model.init();
  recognizer = new KaldiRecognizer(model, 16000);
  modelReady = true;
})();
