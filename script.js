
let isRecording = false;
let mediaRecorder;
let recordedChunks = [];
let audioBlob;
let audioContext;
let analyzer;
let meydaSource;

const micBtn = document.getElementById("mic-btn");
const replayBtn = document.getElementById("replay-btn");
const scoreDisplay = document.getElementById("score-display");
const transcriptDisplay = document.getElementById("transcript");

micBtn.addEventListener("click", async () => {
  if (!isRecording) {
    isRecording = true;
    recordedChunks = [];
    micBtn.textContent = "⏹️";
    scoreDisplay.textContent = "...";

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();

      const source = audioContext.createMediaStreamSource(stream);
      meydaSource = source;

      await new Promise((resolve) => {
        const checkMeyda = setInterval(() => {
          if (window.Meyda && Meyda.createMeydaAnalyzer) {
            clearInterval(checkMeyda);
            resolve();
          }
        }, 100);
      });

      analyzer = Meyda.createMeydaAnalyzer({
        audioContext: audioContext,
        source: meydaSource,
        bufferSize: 512,
        featureExtractors: ["rms", "zcr"],
        callback: (features) => {
          if (features && features.rms !== undefined && features.zcr !== undefined) {
            let score = 100;
            if (features.rms < 0.02) score -= 40;
            if (features.zcr > 0.15) score -= 30;
            scoreDisplay.textContent = Math.max(0, Math.round(score));
          }
        },
      });

      analyzer.start();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        analyzer.stop();
        audioBlob = new Blob(recordedChunks);
        const audioURL = URL.createObjectURL(audioBlob);
        replayBtn.onclick = () => {
          const audio = new Audio(audioURL);
          audio.play();
        };

        // Speech-to-Text
        try {
          const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
          recognition.lang = 'en-US';
          recognition.onresult = function (event) {
            transcriptDisplay.textContent = event.results[0][0].transcript;
          };
          recognition.start();
        } catch (err) {
          transcriptDisplay.textContent = "STT not supported.";
        }

        isRecording = false;
        micBtn.textContent = "🎤";
      };
    } catch (err) {
      console.error("Error accessing mic or initializing Meyda:", err);
      scoreDisplay.textContent = "Mic error";
      isRecording = false;
      micBtn.textContent = "🎤";
    }
  } else {
    mediaRecorder.stop();
  }
});
