
let currentSentence = "";
let isRecording = false;
let mediaRecorder;
let recordedChunks = [];
let recognition;

const micBtn = document.getElementById("micBtn");
const replayBtn = document.getElementById("replayBtn");
const saveBtn = document.getElementById("saveBtn");
const scoreDisplay = document.getElementById("score");
const transcriptDisplay = document.getElementById("transcript");

function calculateScore(expected, actual) {
  const expectedWords = expected.toLowerCase().split(" ");
  const actualWords = actual.toLowerCase().split(" ");
  let matches = 0;
  expectedWords.forEach((word, i) => {
    if (actualWords[i] === word) matches++;
  });
  return Math.round((matches / expectedWords.length) * 100);
}

function initRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const said = event.results[0][0].transcript;
    transcriptDisplay.textContent = "🗣 " + said;
    const score = calculateScore(currentSentence, said);
    scoreDisplay.textContent = score + " / 100";
  };

  recognition.onerror = (e) => {
    transcriptDisplay.textContent = "❌ Không thể nhận diện";
  };
}

async function startMic() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  recordedChunks = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "audio/webm" });
    const audioURL = URL.createObjectURL(blob);

    replayBtn.onclick = () => {
      const audio = new Audio(audioURL);
      audio.play();
    };

    saveBtn.onclick = () => {
      const a = document.createElement("a");
      a.href = audioURL;
      a.download = "recording.webm";
      a.click();
    };
  };

  mediaRecorder.start();
  recognition.start();
}

function stopMic() {
  mediaRecorder.stop();
  recognition.stop();
}

micBtn.onclick = async () => {
  if (!isRecording) {
    isRecording = true;
    micBtn.textContent = "⏹️";
    initRecognition();
    await startMic();
  } else {
    isRecording = false;
    micBtn.textContent = "🎤";
    stopMic();
  }
};

// Dummy placeholder to test:
window.onload = () => {
  currentSentence = "How are you today";
};
