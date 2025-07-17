document.getElementById("file-input").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    document.getElementById("filename-display").textContent = file.name;
    const reader = new FileReader();
    reader.onload = function (event) {
      document.getElementById("content-display").textContent = event.target.result;
    };
    reader.readAsText(file);
  }
});