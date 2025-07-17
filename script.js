
document.getElementById("downloadBtn").addEventListener("click", function () {
  const fileName = "vpm-en.html";
  const link = document.createElement("a");
  link.href = "https://drive.google.com/uc?export=download&id=12V-rT2Alg1ur4TTFxe6f8zPeU0biJbH-";
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  addDownloadedFile(fileName);
});

function addDownloadedFile(filename) {
  const downloadedList = document.getElementById("downloadedList");
  const li = document.createElement("li");
  li.textContent = filename;
  li.addEventListener("click", () => {
    document.getElementById("contentBox").textContent = `Đã chọn: ${filename}`;
  });
  downloadedList.appendChild(li);
}
