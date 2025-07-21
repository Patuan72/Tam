
let currentSentence = "";
let currentRate = 1.0;
let audioBlob = null;
let mediaRecorder;
let audioChunks = [];

const micBtn = document.getElementById("mic");
const replayBtn = document.getElementById("replay");
const saveBtn = document.getElementById("save");
const transcriptBox = document.getElementById("transcript");
const scoreBox = document.querySelector(".score");
const sentenceList = document.getElementById("sentenceList");
const menuBtn = document.getElementById("menuBtn");
const libraryPanel = document.getElementById("library");
const backBtn = document.getElementById("backBtn");

const voskWorker = new Worker("vosk-worker.js");

voskWorker.postMessage({
  command: "loadModel",
  model: {
    files: {
      "model.json": "model.json",
      "model.bin": "model.quantized.bin"
    }
  }
});

voskWorker.onmessage = function(e) {
  if (e.data.text) {
    const transcript = e.data.text.trim();
    transcriptBox.textContent = "🗣 " + transcript;
    const score = compareSentences(currentSentence, transcript);
    scoreBox.textContent = score;
  }
};

micBtn.addEventListener("click", async () => {
  if (!currentSentence) {
    alert("Hãy chọn một câu trước khi ghi âm.");
    return;
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];
  transcriptBox.textContent = "🎙 Đang ghi âm...";

  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) audioChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const audioBlobTemp = new Blob(audioChunks);
    audioBlob = audioBlobTemp;
    stream.getTracks().forEach(track => track.stop());

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      voskWorker.postMessage({ command: "recognize", audio: arrayBuffer });
    };
    reader.readAsArrayBuffer(audioBlob);
  };

  mediaRecorder.start();

  setTimeout(() => {
    mediaRecorder.stop();
  }, 4000); // ghi âm 4 giây
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
  a.download = "recording.wav";
  a.click();
});

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
