document.addEventListener('DOMContentLoaded', () => {
  const loadedFiles = document.getElementById('loadedFiles');
  const viewer = document.getElementById('viewer');
  const dbName = 'VPM_DB', storeName = 'files';

  const openDB = indexedDB.open(dbName, 1);
  openDB.onupgradeneeded = e => {
    e.target.result.createObjectStore(storeName, { keyPath: 'name' });
  };
  openDB.onsuccess = e => {
    const db = e.target.result;
    loadFiles(db);

    document.getElementById('textInput').addEventListener('change', event => {
      const content = event.target.value;
      const fileName = "Tài liệu người dùng";
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put({ name: fileName, content });
      tx.oncomplete = () => loadFiles(db);
    });

    function loadFiles(db) {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => {
        loadedFiles.innerHTML = '';
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
          loadedFiles.appendChild(li);
        });
      };
    }
  };
});
