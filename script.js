
const sentenceBox = document.querySelector(".sentence");
const transcriptBox = document.querySelector(".transcript");
const scoreBox = document.querySelector(".score");
const micBtn = document.getElementById("mic");

function compareSentences(expected, actual) {
  const clean = str => str.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const expectedWords = clean(expected).split(" ");
  const actualWords = clean(actual).split(" ");
  let match = 0;
  expectedWords.forEach((word, i) => {
    if (actualWords[i] && actualWords[i] === word) match++;
  });
  const score = Math.round((match / expectedWords.length) * 100);
  return score;
}

// Khởi tạo worker
const voskWorker = new Worker("vosk-worker.js");

// Gửi model
voskWorker.postMessage({
  command: "loadModel",
  model: {
    files: {
      "model.json": "model.json",
      "model.bin": "model.quantized.bin"
    }
  }
});

// Nhận kết quả từ worker
voskWorker.onmessage = function(e) {
  if (e.data.text) {
    const transcript = e.data.text.trim();
    transcriptBox.textContent = "You said: " + transcript;
    const sentence = sentenceBox?.textContent || "";
    const score = compareSentences(sentence, transcript);
    scoreBox.textContent = score;
  }
};

// Bắt đầu ghi âm khi bấm mic
let mediaRecorder;
let audioChunks = [];

micBtn.onclick = async () => {
  transcriptBox.textContent = "🎤 Listening...";
  scoreBox.textContent = "--";
  audioChunks = [];

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();

  mediaRecorder.ondataavailable = e => {
    audioChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(audioChunks);
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      voskWorker.postMessage({ command: "recognize", audio: arrayBuffer }, [arrayBuffer]);
    };
    reader.readAsArrayBuffer(blob);
  };

  setTimeout(() => {
    mediaRecorder.stop();
  }, 4000); // ghi âm 4 giây
};
