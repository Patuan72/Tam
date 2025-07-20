
document.addEventListener("DOMContentLoaded", () => {
  const micBtn = document.getElementById("mic");
  const replayBtn = document.getElementById("replay");
  const saveBtn = document.getElementById("save");
  const sentenceList = document.getElementById("sentenceList");
  const transcriptBox = document.getElementById("transcript");
  const scoreBox = document.querySelector(".score");
  const unitLinks = document.querySelectorAll("#downloadedList a");

  let currentSentence = "";
  let currentRate = 1.0;
  let audioBlob = null;
  let mediaRecorder;
  let audioChunks = [];

  // Giọng đọc mẫu
  function speakSentence(sentence) {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "en-US";
    utterance.rate = currentRate;
    speechSynthesis.speak(utterance);
  }

  // Ghi âm khi bấm mic
  micBtn.addEventListener("click", async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 4000); // ghi âm 4 giây
  });

  // Replay bản ghi
  replayBtn.addEventListener("click", () => {
    if (!audioBlob) return alert("Chưa có bản ghi.");
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
  });

  // Save bản ghi
  saveBtn.addEventListener("click", () => {
    if (!audioBlob) return alert("Chưa có bản ghi để lưu.");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(audioBlob);
    a.download = "recording.wav";
    a.click();
  });

  // Chọn tốc độ
  document.querySelectorAll(".dot").forEach((dot, index) => {
    dot.addEventListener("click", () => {
      document.querySelectorAll(".dot").forEach(d => d.classList.remove("selected"));
      dot.classList.add("selected");
      currentRate = [0.6, 1.0, 1.4][index];
    });
  });

  // Tải và hiển thị câu
  unitLinks.forEach(link => {
    link.addEventListener("click", async e => {
      e.preventDefault();
      const res = await fetch(link.dataset.unit);
      const data = await res.json();
      sentenceList.innerHTML = "";
      data.sentences.forEach(sentence => {
        const div = document.createElement("div");
        div.textContent = sentence;
        div.className = "sentence-item";
        div.addEventListener("click", () => {
          currentSentence = sentence;
          speakSentence(sentence);
        });
        sentenceList.appendChild(div);
      });
    });
  });

  // Nhận dạng và chấm điểm
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    micBtn.addEventListener("dblclick", () => {
      if (!currentSentence) return alert("Chọn một câu trước khi chấm điểm.");
      transcriptBox.textContent = "🎙 Listening...";
      recognition.start();
    });

    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      transcriptBox.textContent = "🗣 " + transcript;
      const score = compareSentences(currentSentence, transcript);
      scoreBox.textContent = score;
    };

    recognition.onerror = e => {
      transcriptBox.textContent = "❌ Lỗi nhận dạng: " + e.error;
      scoreBox.textContent = "0";
    };
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
});
