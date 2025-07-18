const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const viewer = document.getElementById('viewer');
const dbName = 'VPM_DB', storeName = 'files';

// Init IndexedDB
const openDB = indexedDB.open(dbName, 1);
openDB.onupgradeneeded = e => {
  e.target.result.createObjectStore(storeName, { keyPath: 'name' });
};
openDB.onsuccess = e => {
  const db = e.target.result;
  loadFiles(db);

  fileInput.addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.html')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put({ name: file.name, content });
      tx.oncomplete = () => loadFiles(db);
    };
    reader.readAsText(file);
  });

  function loadFiles(db) {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => {
      fileList.innerHTML = '';
      req.result.forEach(file => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = file.name;
        a.href = '#';
        a.onclick = () => {
          const blob = new Blob([file.content], { type: 'text/html' });
          viewer.src = URL.createObjectURL(blob);
        };
        li.appendChild(a);
        fileList.appendChild(li);
      });
    };
  }
};


// IndexedDB setup
let db;
const request = indexedDB.open("VPM_DB", 1);
request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "id" });
    }
};
request.onsuccess = function(event) {
    db = event.target.result;
    loadFromDB();
};

// Nút "Nạp vào"
document.getElementById("loadIntoIframe").addEventListener("click", function () {
    const htmlContent = '<!DOCTYPE html><html><body><h1>Giáo trình đã nạp</h1></body></html>'; // mẫu đơn giản
    const transaction = db.transaction(["files"], "readwrite");
    const store = transaction.objectStore("files");
    store.put({ id: "current", content: htmlContent });
    loadFromDB();
});

// Hiển thị từ DB
function loadFromDB() {
    if (!db) return;
    const transaction = db.transaction(["files"], "readonly");
    const store = transaction.objectStore("files");
    const getRequest = store.get("current");
    getRequest.onsuccess = function () {
        if (getRequest.result) {
            const iframe = document.querySelector("iframe");
            const blob = new Blob([getRequest.result.content], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            iframe.src = url;
        }
    };
}
