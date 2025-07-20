
let mediaRecorder;
let recordedChunks = [];
let currentBlob = null;
let currentSentence = "";

const micBtn = document.getElementById("mic");
const checkBtn = document.getElementById("check");
const replayBtn = document.getElementById("replay");
const saveBtn = document.getElementById("save");
const transcriptElem = document.getElementById("transcript");
const scoreElem = document.querySelector(".score");

micBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream);
  micBtn.classList.add("recording");

  mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
  mediaRecorder.onstop = () => {
    currentBlob = new Blob(recordedChunks);
    micBtn.classList.remove("recording");
  };

  mediaRecorder.start();

  setTimeout(() => {
    mediaRecorder.stop();
  }, 3000);
};

checkBtn.onclick = () => {
  if (!currentSentence) {
    alert("Bạn chưa chọn câu cần luyện!");
    return;
  }

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.onresult = event => {
    const spoken = event.results[0][0].transcript.toLowerCase().trim();
    const target = currentSentence.toLowerCase().trim();
    transcriptElem.textContent = `🗣 Bạn nói: ${spoken}`;

    let score = 0;
    if (spoken && target) {
      const match = spoken === target;
      score = match ? 100 : Math.max(20, 100 - Math.abs(spoken.length - target.length) * 5);
    }

    scoreElem.textContent = score;
  };
  recognition.onerror = () => {
    transcriptElem.textContent = "Không nhận diện được giọng nói.";
  };
  recognition.start();
  transcriptElem.textContent = "🎧 Listening...";
};

replayBtn.onclick = () => {
  if (currentBlob) {
    replayBtn.classList.add("playing");
    const audioURL = URL.createObjectURL(currentBlob);
    const audio = new Audio(audioURL);
    audio.onended = () => {
      replayBtn.classList.remove("playing");
    };
    audio.play();
  } else {
    alert("Chưa có bản ghi âm.");
  }
};

saveBtn.onclick = () => {
  if (!currentBlob) {
    alert("Không có dữ liệu ghi âm để lưu!");
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(currentBlob);
  a.download = "recording.wav";
  a.click();
};

function renderSentences(sentences) {
  const list = document.getElementById("sentenceList");
  list.innerHTML = "";
  sentences.forEach((s, index) => {
    const div = document.createElement("div");
    div.textContent = `${index + 1}. ${s}`;
    div.onclick = () => {
      currentSentence = s;
      transcriptElem.textContent = "🗣 Bạn nói: ...";
    };
    list.appendChild(div);
  });
}

async function loadSentences(unitFile) {
  const res = await fetch(unitFile);
  const data = await res.json();
  renderSentences(data.sentences || []);
}

loadSentences("unit1.json");
