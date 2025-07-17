
document.getElementById("download-btn").addEventListener("click", () => {
  const url = "https://drive.google.com/uc?export=download&id=12Q5q8y5bIVP4klZ4DPFVSxGC4o2ekS3Z";
  const name = "baihoc1.html";

  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const fileURL = URL.createObjectURL(blob);
      localStorage.setItem("baihoc1", fileURL);
      alert("Đã tải giáo trình!");
      loadLibrary();
    });
});

function loadLibrary() {
  const list = document.getElementById("lesson-list");
  list.innerHTML = "";
  for (let key in localStorage) {
    if (key.startsWith("baihoc")) {
      const li = document.createElement("li");
      li.textContent = key;
      li.addEventListener("click", () => {
        fetch(localStorage.getItem(key))
          .then(res => res.text())
          .then(html => {
            document.getElementById("lesson-content").innerHTML = html;
          });
      });
      list.appendChild(li);
    }
  }
}

window.onload = loadLibrary;
