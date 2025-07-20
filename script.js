
document.addEventListener("DOMContentLoaded", () => {
  const replayBtn = document.getElementById("replay");
  const micBtn = document.getElementById("mic");
  const saveBtn = document.getElementById("save");
  const sentenceList = document.getElementById("sentenceList");

  let mediaRecorder;
  let audioChunks = [];
  let audioBlob = null;
  let currentRate = 1.0;
  let currentSentence = ""; const transcriptBox = document.querySelector("#transcript");

  let recognitionSupported = false;
  let recognition;
  try {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionSupported = true;
  } catch (e) {
    console.warn("SpeechRecognition not supported:", e);
  }

  function compareSentences(expected, actual) {
    const clean = s => s.toLowerCase().replace(/[.,!?]/g, "").trim();
    const expectedWords = clean(expected).split(" ");
    const actualWords = clean(actual).split(" ");
    let matchCount = 0;
    expectedWords.forEach((word, i) => {
      if (actualWords[i] && actualWords[i] === word) matchCount++;
    });
    return Math.round((matchCount / expectedWords.length) * 100);
  }

  replayBtn.addEventListener("click", () => {
    if (!audioBlob) {
      alert("Chưa có bản ghi âm nào để phát lại!");
      return;
    }
    replayBtn.textContent = "⏳";
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);
    audio.play();
    audio.onended = () => {
      replayBtn.textContent = "🔁";
    };
  });

  micBtn.addEventListener("click", async () => {
    if (micBtn.textContent === "🎤") {
      micBtn.textContent = "🔴";
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

        if (recognitionSupported && currentSentence) {
          recognition.start();
          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            transcriptBox.textContent = "🗣 Bạn nói: " + transcript;
            const score = compareSentences(currentSentence, transcript);
            document.querySelector(".score").textContent = score;
          };
          recognition.onerror = (event) => {
            console.error("Lỗi nhận dạng:", event.error);
            transcriptBox.textContent = "⚠️ Không thể nhận dạng giọng nói.";
            document.querySelector(".score").textContent = "0";
          };
        }
      };

      mediaRecorder.start();
    } else {
      micBtn.textContent = "🎤";
      mediaRecorder.stop();
    }
  });

  saveBtn.addEventListener("click", () => {
    if (!audioBlob) {
      alert("Bạn cần ghi âm trước khi lưu!");
      return;
    }
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ghi-am.wav";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    saveBtn.textContent = "✅";
    setTimeout(() => {
      saveBtn.textContent = "💾";
    }, 1000);
  });

  document.getElementById("menuBtn").addEventListener("click", () => {
    const lib = document.getElementById("library");
    lib.classList.toggle("hidden");
  });

  document.getElementById("backBtn").addEventListener("click", () => {
    document.getElementById("library").classList.add("hidden");
  });

  document.querySelectorAll('.dot').forEach((dot, index) => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.dot').forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
      const rates = [0.6, 1.0, 1.4];
      currentRate = rates[index];
    });
  });

  document.querySelectorAll('#downloadedList a').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const unitFile = link.getAttribute("data-unit");
      const res = await fetch(unitFile);
      const data = await res.json();

      sentenceList.innerHTML = "";
      data.sentences.forEach(sentence => {
        const div = document.createElement("div");
        div.textContent = sentence;
        div.className = "sentence-item";
        div.style.cursor = "pointer";
        div.onclick = () => {
          currentSentence = sentence;
          const utterance = new SpeechSynthesisUtterance(sentence);
          utterance.rate = currentRate;
          speechSynthesis.speak(utterance);
        };
        sentenceList.appendChild(div);
      });

      document.getElementById("library").classList.add("hidden");
    });
  });
});
