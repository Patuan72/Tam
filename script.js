
let isRecording = false;
let mediaRecorder;
let recordedChunks = [];
let audioBlob;

const micBtn = document.getElementById("mic-btn");
const replayBtn = document.getElementById("replay-btn");
const transcriptDisplay = document.getElementById("transcript");

micBtn.addEventListener("click", async () => {
  if (!isRecording) {
    isRecording = true;
    recordedChunks = [];
    micBtn.textContent = "⏹️";

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
