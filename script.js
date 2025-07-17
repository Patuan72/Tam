function renderCurriculumList() {
  const list = JSON.parse(localStorage.getItem("curriculums")) || [];
  const container = document.getElementById("curriculumList");
  container.innerHTML = "";

  list.forEach((item, index) => {
    const btn = document.createElement("button");
    btn.innerText = item.name;
    btn.onclick = () => {
      document.getElementById("contentBox").innerHTML = item.content;
    };
    container.appendChild(btn);
  });
}

// Ví dụ thêm giáo trình thủ công (nên thay bằng fetch thực tế)
if (!localStorage.getItem("curriculums")) {
  const example = [{
    name: "Giáo trình mẫu",
    url: "#",
    content: "<h2>Bài học 1: Hello!</h2><p>Chào mừng bạn đến với giáo trình.</p>"
  }];
  localStorage.setItem("curriculums", JSON.stringify(example));
}
