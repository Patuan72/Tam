
document.addEventListener("DOMContentLoaded", function () {
  const downloadedList = document.getElementById("downloaded-list");
  const uploadInput = document.getElementById("upload-input");

  function addToLibrary(fileName) {
    const entry = document.createElement("div");
    entry.innerHTML = "📚 " + fileName;
    entry.className = "downloaded-item";
    downloadedList.appendChild(entry);
  }

  document.querySelectorAll(".download-link").forEach(link => {
    link.addEventListener("click", function (e) {
      const fileName = this.getAttribute("data-name");
      setTimeout(() => {
        addToLibrary(fileName);
      }, 1000);
    });
  });
});
