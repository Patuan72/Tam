
document.addEventListener("DOMContentLoaded", () => {
  const replayBtn = document.getElementById("replay");
  const micBtn = document.getElementById("mic");
  const saveBtn = document.getElementById("save");
  const menuBtn = document.getElementById("menuBtn");
  const backBtn = document.getElementById("backBtn");
  const viewer = document.getElementById("viewer");
  const giaotrinhLink = document.getElementById("giaotrinhLink");
  const fileInput = document.getElementById("fileInput");

  let mediaRecorder;
  let audioChunks = [];
  let audioBlob = null;

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

  menuBtn.addEventListener("click", () => {
    document.getElementById("library").classList.toggle("hidden");
  });

  backBtn.addEventListener("click", () => {
    document.getElementById("library").classList.add("hidden");
  });

  document.querySelectorAll('.dot').forEach((dot, index) => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.dot').forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
      console.log('Tốc độ được chọn:', ['Chậm', 'Trung bình', 'Nhanh'][index]);
    });
  });

  // IndexedDB logic để lưu và xem file giáo trình
  const dbName = 'VPM_DB';
  const storeName = 'giaotrinh';
  let db;

  const openDB = indexedDB.open(dbName, 1);
  openDB.onupgradeneeded = e => {
    db = e.target.result;
    db.createObjectStore(storeName);
  };
  openDB.onsuccess = e => {
    db = e.target.result;
  };

  giaotrinhLink.addEventListener("click", () => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const getReq = store.get("file");
    getReq.onsuccess = () => {
      if (getReq.result) {
        const blob = new Blob([getReq.result], { type: "text/html" });
        viewer.src = URL.createObjectURL(blob);
      } else {
        alert("Chưa có giáo trình được lưu.");
      }
    };
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".html")) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        store.put(evt.target.result, "file");
        alert("Đã lưu giáo trình!");
      };
      reader.readAsText(file);
    }
  });
});
