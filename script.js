
let isRecording = false;
let mediaRecorder;
let recordedChunks = [];
let audioBlob;
let audioContext;
let sourceNode;

const micBtn = document.getElementById("mic-btn");
const replayBtn = document.getElementById("replay-btn");
const scoreDisplay = document.getElementById("score-display");
const transcriptDisplay = document.getElementById("transcript");

micBtn.addEventListener("click", async () => {
  if (!isRecording) {
    isRecording = true;
    recordedChunks = [];
    micBtn.textContent = "⏹️";
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    const source = audioContext.createMediaStreamSource(stream);
    const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (window.Meyda) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });

    Meyda.bufferSize = 2048;
    Meyda.windowingFunction = "hanning";
    Meyda.sampleRate = audioContext.sampleRate;

    scriptProcessor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      const features = Meyda.extract(["rms", "zcr"], input);
      if (features && features.rms && features.zcr) {
        const rms = features.rms;
        const zcr = features.zcr;
        let score = 100;
        if (rms < 0.02) score -= 40;
        if (zcr > 0.15) score -= 30;
        scoreDisplay.textContent = Math.max(0, Math.round(score));
      }
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      audioBlob = new Blob(recordedChunks);
      const audioURL = URL.createObjectURL(audioBlob);
      replayBtn.onclick = () => {
        const audio = new Audio(audioURL);
        audio.play();
      };

      // Speech-to-Text (hiển thị nội dung)
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
  } else {
    mediaRecorder.stop();
  }
});
