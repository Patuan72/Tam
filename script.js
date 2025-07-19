function toggleLibrary() {
  const modal = document.getElementById('libraryModal');
  modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function openGiaotrinh() {
  loadFromIndexedDB('giaotrinh.html', function (blob) {
    const iframe = document.getElementById('giaotrinhIframe');
    iframe.src = URL.createObjectURL(blob);
    document.getElementById('iframeContainer').style.display = 'block';
  });
}

// Simulate saving giaotrinh.html for demo purpose
window.onload = function () {
  fetch('https://example.com/sample.html') // You can replace with actual file
    .then(response => response.blob())
    .then(blob => {
      saveToIndexedDB('giaotrinh.html', blob);
    });
};

function saveToIndexedDB(filename, blob) {
  const request = indexedDB.open("LibraryDB", 1);
  request.onupgradeneeded = function (e) {
    const db = e.target.result;
    if (!db.objectStoreNames.contains("files")) {
      db.createObjectStore("files");
    }
  };
  request.onsuccess = function (e) {
    const db = e.target.result;
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put(blob, filename);
  };
}

function loadFromIndexedDB(filename, callback) {
  const request = indexedDB.open("LibraryDB", 1);
  request.onsuccess = function (e) {
    const db = e.target.result;
    const tx = db.transaction("files", "readonly");
    const getRequest = tx.objectStore("files").get(filename);
    getRequest.onsuccess = function () {
      callback(getRequest.result);
    };
  };
}
