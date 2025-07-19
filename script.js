
// Tạo hoặc mở CSDL
const dbName = 'VPM_DB';
const storeName = 'files';

function openDatabase(callback) {
  const request = indexedDB.open(dbName, 1);
  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    db.createObjectStore(storeName, { keyPath: 'name' });
  };
  request.onsuccess = (e) => {
    callback(e.target.result);
  };
}

// Luôn hiển thị "Giáo trình"
window.addEventListener("load", () => {
  openDatabase((db) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const defaultContent = '<html><body><h1>Chào mừng đến với Giáo trình</h1><p>Nội dung mẫu giáo trình đã tải.</p></body></html>';
    const getReq = store.get("Giáo trình");
    getReq.onsuccess = () => {
      const existed = getReq.result;
      if (!existed) {
        store.put({ name: "Giáo trình", content: defaultContent });
      }

      const contentToUse = existed ? existed.content : defaultContent;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = "Giáo trình";
      a.href = "#";
      a.onclick = () => {
        const blob = new Blob([contentToUse], { type: "text/html" });
        document.getElementById("viewer").src = URL.createObjectURL(blob);
      };
      li.appendChild(a);
      document.getElementById("downloadedList").appendChild(li);
    };
  });
});
