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
      
      isRecording = true;

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlobTemp = new Blob(audioChunks, { type: "audio/wav" });
        audioBlob = audioBlobTemp;
        const context = new AudioContext();
        const reader = new FileReader();
        reader.onload = async () => {
          const buffer = await context.decodeAudioData(reader.result);
          const source = context.createBufferSource();
          source.buffer = buffer;
          const analyser = Meyda.createMeydaAnalyzer({
            audioContext: context,
            source: source,
            bufferSize: 512,
            featureExtractors: ['rms', 'zcr', 'spectralFlatness'],
            callback: features => {
              const { rms, zcr, spectralFlatness } = features;
              let score = 100;
              score -= Math.min(40, (0.02 - rms) * 2000);
              score -= Math.max(0, (zcr - 0.2) * 150);
              score -= Math.max(0, (spectralFlatness - 0.5) * 100);
              score = Math.max(0, Math.min(100, Math.round(score)));
              scoreBox.textContent = score;
            }
          });
          source.connect(context.destination);
          analyser.start();
          source.start();
        };
        reader.readAsArrayBuffer(audioBlob);
    
        stream.getTracks().forEach(track => track.stop());

        const audio = new Audio(URL.createObjectURL(audioBlob));
        audio.play();

        

        audio.onended = () => {
          
          
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
          document.querySelectorAll(".sentence-item").forEach(el => el.classList.remove("selected"));
          div.classList.add("selected");
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
