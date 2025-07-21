
let isRecording = false;
let mediaRecorder;
let recordedChunks = [];
let audioBlob;

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

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      audioBlob = new Blob(recordedChunks, { type: "audio/webm" });
      const audioURL = URL.createObjectURL(audioBlob);

      replayBtn.onclick = () => {
        const audio = new Audio(audioURL);
        audio.play();
      };

      // Meyda offline analysis
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const decodedData = await audioContext.decodeAudioData(arrayBuffer);
        const channelData = decodedData.getChannelData(0); // mono

        const features = Meyda.extract(["rms", "zcr"], channelData);

        let score = 100;
        if (features.rms < 0.02) score -= 40;
        if (features.zcr > 0.15) score -= 30;

        scoreDisplay.textContent = Math.max(0, Math.round(score));
      } catch (err) {
        console.error("Meyda analysis failed:", err);
        scoreDisplay.textContent = "0";
      }

      // STT hiển thị
      try {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US";
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
