const dbName = "GiaoTrinhDB";
const storeName = "htmlFiles";
const fileUrl = "https://drive.google.com/u/0/uc?id=138bZpmcvtkNAyp5_uRBOS5OnjbcQcmRL&export=download";
const fileName = "GiaoTrinh.html";

document.addEventListener("DOMContentLoaded", async () => {
  const db = await initDB();

  document.getElementById("downloadGiaoTrinhBtn").addEventListener("click", async () => {
    const content = await fetchFile(fileUrl);
    await saveToIndexedDB(db, fileName, content);
    renderSavedFiles(db);
  });

  renderSavedFiles(db);
});

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = () => reject("DB error");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(storeName);
    };
  });
}

function fetchFile(url) {
  return fetch(url).then((res) => res.text());
}

function saveToIndexedDB(db, name, content) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], "readwrite");
    const store = tx.objectStore(storeName);
    store.put(content, name);
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
}

function renderSavedFiles(db) {
  const container = document.getElementById("downloadedList");
  container.innerHTML = "";
  const tx = db.transaction([storeName], "readonly");
  const store = tx.objectStore(storeName);
  const getReq = store.get(fileName);
  getReq.onsuccess = () => {
    if (getReq.result) {
      const iframe = document.createElement("iframe");
      iframe.srcdoc = getReq.result;
      container.appendChild(iframe);
    }
  };
}
