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
