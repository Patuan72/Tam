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

  let currentSentence = "";
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
          transcriptBox.textContent = "🧠 Đang nhận diện...";
          recognition.start();
        };
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
    const recognition = new SpeechRecognition();
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

// --- Mic & Replay Logic ---

let recognition;
let recognizing = false;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        const currentText = document.querySelector('.sample-sentence')?.textContent?.toLowerCase().trim() || '';
        let score = 0;

        if (currentText && transcript) {
            const transcriptWords = transcript.split(/\s+/);
            const targetWords = currentText.split(/\s+/);
            let matchCount = 0;
            targetWords.forEach((word, i) => {
                if (transcriptWords[i] && transcriptWords[i] === word) {
                    matchCount++;
                }
            });
            score = Math.round((matchCount / targetWords.length) * 100);
        }

        document.getElementById("score").textContent = score;
        document.getElementById("transcript").textContent = transcript;
        recognizing = false;
    };

    recognition.onerror = (e) => {
        console.error("Recognition error:", e);
        recognizing = false;
    };

    recognition.onend = () => {
        recognizing = false;
    };
}

const micBtn = document.getElementById("mic-btn");
if (micBtn) {
    micBtn.addEventListener("click", () => {
        if (!recognition) return;
        if (recognizing) {
            recognition.stop();
        } else {
            recognition.start();
            recognizing = true;
        }
    });
}

// Replay logic
document.querySelectorAll(".replay-icon").forEach(icon => {
    icon.addEventListener("click", () => {
        const audio = icon.closest(".sample")?.querySelector("audio");
        if (audio) audio.play();
    });
});
