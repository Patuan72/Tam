
document.addEventListener("DOMContentLoaded", () => {
  const micBtn = document.getElementById("micBtn");
  const replayBtn = document.getElementById("replayBtn");
  const saveBtn = document.getElementById("saveBtn");
  const sentenceContainer = document.getElementById("sentence-container");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const transcriptDisplay = document.getElementById("transcriptDisplay");
  const libraryLinks = document.querySelectorAll("#downloadedList a");

  let currentSentence = "";
  let currentRate = 1.0;
  let audioBlob = null;

  let mediaRecorder;
  let audioChunks = [];

  function clean(text) {
    return text.toLowerCase().replace(/[.,!?]/g, "").trim();
  }

  function compareSentences(expected, actual) {
    const expectedWords = clean(expected).split(" ");
    const actualWords = clean(actual).split(" ");
    let matchCount = 0;
    expectedWords.forEach((word, i) => {
      if (actualWords[i] && actualWords[i] === word) matchCount++;
    });
    return Math.round((matchCount / expectedWords.length) * 100);
  }

  function speakSentence(sentence) {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "en-US";
    utterance.rate = currentRate;
    speechSynthesis.speak(utterance);
  }

  micBtn.addEventListener("click", async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 4000); // 4s ghi âm
  });

  replayBtn.addEventListener("click", () => {
    if (!audioBlob) {
      alert("Chưa có bản ghi nào.");
      return;
    }
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
  });

  saveBtn.addEventListener("click", () => {
    if (!audioBlob) {
      alert("Chưa có bản ghi nào để lưu.");
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(audioBlob);
    a.download = "recording.wav";
    a.click();
  });

  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    micBtn.addEventListener("dblclick", () => {
      if (!currentSentence) {
        alert("Vui lòng chọn câu.");
        return;
      }
      transcriptDisplay.textContent = "🎙 Listening...";
      recognition.start();
    });

    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      transcriptDisplay.textContent = "🗣 " + transcript;
      const score = compareSentences(currentSentence, transcript);
      scoreDisplay.textContent = score;
    };

    recognition.onerror = event => {
      transcriptDisplay.textContent = "Lỗi nhận dạng: " + event.error;
    };
  }

  libraryLinks.forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const unit = link.dataset.unit;
      const res = await fetch(unit);
      const data = await res.json();
      sentenceContainer.innerHTML = "";
      data.sentences.forEach(sentence => {
        const div = document.createElement("div");
        div.textContent = sentence;
        div.className = "sentence-item";
        div.addEventListener("click", () => {
          currentSentence = sentence;
          speakSentence(sentence);
        });
        sentenceContainer.appendChild(div);
      });
    });
  });

  document.querySelectorAll(".dot").forEach((dot, index) => {
    dot.addEventListener("click", () => {
      document.querySelectorAll(".dot").forEach(d => d.classList.remove("selected"));
      dot.classList.add("selected");
      currentRate = [0.6, 1.0, 1.4][index];
    });
  });
});
