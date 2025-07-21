let recognition;


document.addEventListener("DOMContentLoaded", () => {
  const micBtn = document.getElementById("mic");
  const replayBtn = document.getElementById("replay");
  const saveBtn = document.getElementById("save");
  const transcriptBox = document.getElementById("transcript");
  const scoreBox = document.querySelector(".score");
  const sentenceList = document.getElementById("sentenceList");
  const menuBtn = document.getElementById("menuBtn");
  const libraryPanel = document.getElementById("library");
  const backBtn = document.getElementById("backBtn");

  let currentSentence = document.querySelector(".sentence").textContent.trim();
  let currentRate = 1.0;
  let audioBlob = null;
  let mediaRecorder;
  let audioChunks = [];
  let isRecording = false;

  function toggleLabelMode(show) {
    document.querySelectorAll(".icon").forEach(btn => {
      if (show) btn.classList.add("text-label");
      else btn.classList.remove("text-label");
    });
  }

  toggleLabelMode(true);

  menuBtn.addEventListener("click", () => {
    libraryPanel.classList.remove("hidden");
  });

  backBtn.addEventListener("click", () => {
    libraryPanel.classList.add("hidden");
  });

  micBtn.addEventListener("click", async () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert('Trình duyệt không hỗ trợ nhận diện giọng nói.'); return;
    }
    if (!currentSentence) {
      alert("Hãy chọn một câu trước khi ghi âm.");
      return;
    }

    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      transcriptBox.textContent = "🎙 Đang ghi âm... (bấm lại để dừng)";
      isRecording = true;

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlobTemp = new Blob(audioChunks, { type: "audio/wav" });
        audioBlob = audioBlobTemp;
        stream.getTracks().forEach(track => track.stop());

        const audio = new Audio(URL.createObjectURL(audioBlob));
        audio.play();

        transcriptBox.textContent = "🔁 Đang phát lại...";

        audio.onended = () => {
          transcriptBox.textContent = "";
        };
        recognition.start();
      };

      mediaRecorder.start();
    } else {
      isRecording = false;
      mediaRecorder.stop();
    }
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

  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      transcriptBox.textContent = "🗣 " + transcript;
      const score = compareSentences(currentSentence, transcript);
      scoreBox.textContent = score;
    };

    recognition.onerror = e => {
      transcriptBox.textContent = "❌ Lỗi: " + e.error;
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
