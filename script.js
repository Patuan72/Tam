
document.addEventListener("DOMContentLoaded", () => {
  const micBtn = document.getElementById("mic");
  const sentenceList = document.getElementById("sentenceList");
  const scoreBox = document.querySelector(".score");
  const transcriptBox = document.getElementById("transcript");

  let currentRate = 1.0;
  let currentSentence = "";

  let recognitionSupported = false;
  let recognition;

  try {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionSupported = true;
  } catch (e) {
    transcriptBox.textContent = "⚠️ Trình duyệt không hỗ trợ SpeechRecognition.";
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

  micBtn.addEventListener("click", () => {
    if (!recognitionSupported) {
      alert("Trình duyệt không hỗ trợ SpeechRecognition.");
      return;
    }

    if (!currentSentence) {
      transcriptBox.textContent = "⚠️ Bạn chưa chọn câu.";
      return;
    }

    transcriptBox.textContent = "🎙 Đang nghe...";
    recognition.start();
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    transcriptBox.textContent = "🗣 Bạn nói: " + transcript;
    const score = compareSentences(currentSentence, transcript);
    scoreBox.textContent = score;
  };

  recognition.onerror = (event) => {
    transcriptBox.textContent = "⚠️ Lỗi nhận dạng: " + event.error;
    scoreBox.textContent = "0";
  };

  // Load câu từ JSON
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
          utterance.volume = 1.0;
          speechSynthesis.speak(utterance);
        };
        sentenceList.appendChild(div);
      });

      document.getElementById("library").classList.add("hidden");
    });
  });

  document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("library").classList.toggle("hidden");
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
});
