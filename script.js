
document.addEventListener("DOMContentLoaded", () => {
  const replayBtn = document.getElementById("replay");
  const micBtn = document.getElementById("mic");
  const saveBtn = document.getElementById("save");
  const textarea = document.querySelector("textarea");

  let mediaRecorder;
  let audioChunks = [];
  let audioBlob = null;

  replayBtn.addEventListener("click", () => {
    if (!audioBlob) {
      alert("Chưa có bản ghi âm nào để phát lại!");
      return;
    }
    replayBtn.textContent = "⏳"; // chuyển sang trạng thái đang phát
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);
    audio.play();
    audio.onended = () => {
      replayBtn.textContent = "🔁"; // quay lại trạng thái mặc định
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
        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);
        audio.play();
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
});

document.getElementById("menuBtn").addEventListener("click", () => {
  const lib = document.getElementById("library");
  lib.classList.toggle("hidden");
});

const curriculumData = {
  "vpm-en": "Hello! How are you today?\nI'm fine, thank you. And you?"
};

document.addEventListener("click", function (e) {
  if (e.target && e.target.classList.contains("download-btn")) {
    const item = e.target.parentElement;
    const id = e.target.dataset.id;
    const downloadedList = document.getElementById("downloadedList");
    item.removeChild(e.target);
    downloadedList.appendChild(item);

    if (curriculumData[id]) {
      document.querySelector("textarea").value = curriculumData[id];
      alert("Đã tải và nạp nội dung giáo trình vào màn hình học.");
    }
  }
});

document.getElementById("backBtn").addEventListener("click", () => {
  document.getElementById("library").classList.add("hidden");
});

document.querySelectorAll('.dot').forEach((dot, index) => {
  dot.addEventListener('click', () => {
    document.querySelectorAll('.dot').forEach(d => d.classList.remove('selected'));
    dot.classList.add('selected');
    console.log('Tốc độ được chọn:', ['Chậm', 'Trung bình', 'Nhanh'][index]);
  });
});


const replayBtn = document.getElementById('replayBtn');
let isReplaying = false;

function toggleReplay() {
  if (!replayBtn) return;
  isReplaying = !isReplaying;
  replayBtn.textContent = isReplaying ? "⏳ Đang phát..." : "🔁 Replay";
}

// Kết nối khi nhấn replay
if (replayBtn) {
  replayBtn.addEventListener('click', () => {
    toggleReplay();
    // Phát lại audio, giả định dùng phần tử audio id="player"
    const audio = document.getElementById('player');
    if (audio) {
      audio.play();
      audio.onended = () => {
        toggleReplay();
      };
    } else {
      toggleReplay(); // fallback nếu không có audio
    }
  });
}


  link.addEventListener('click', () => {
    const title = link.getAttribute('data-title');
    if (title) {
      const downloadedList = document.getElementById('downloadedList');
      const li = document.createElement('li');
      li.textContent = title + " (đã tải)";
      downloadedList.appendChild(li);
    }
  });
});

// Theo dõi các link tải về có class 'track-download'
document.querySelectorAll('.track-download').forEach(link => {
  link.addEventListener('click', () => {
    const title = link.getAttribute('data-title');
    const href = link.getAttribute('href');
    if (title && href) {
      const downloadedList = document.getElementById('downloadedList');
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.target = "_blank";
      a.textContent = title;
      li.appendChild(a);
      li.append(" (đã tải)");
      downloadedList.appendChild(li);
    }
  });
});
