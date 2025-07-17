
function downloadLesson() {
  const url = document.getElementById('url-input').value;
  const fileId = url.match(/[-\w]{25,}/);
  if (!fileId) return alert("Link không hợp lệ");

  const lessonUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const fileName = "lesson_" + Date.now() + ".html";

  fetch(lessonUrl)
    .then(response => response.text())
    .then(content => {
      localStorage.setItem(fileName, content);
      addToLibrary(fileName);
    })
    .catch(err => alert("Lỗi tải bài học!"));
}

function addToLibrary(name) {
  const list = document.getElementById("lesson-list");
  const li = document.createElement("li");
  li.textContent = name;
  li.onclick = () => {
    const html = localStorage.getItem(name);
    const blob = new Blob([html], { type: "text/html" });
    document.getElementById("lesson-frame").src = URL.createObjectURL(blob);
  };
  list.appendChild(li);
}

// Tải thư viện từ localStorage
window.onload = () => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("lesson_")) addToLibrary(key);
  }
};
