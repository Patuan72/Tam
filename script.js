
let currentAudioList = [];
let selectedUnitId = "";

document.getElementById("menuBtn").addEventListener("click", () => {
  const lib = document.getElementById("library");
  lib.classList.toggle("hidden");
});

function loadUnit(unit) {
  document.getElementById("unitTitle").textContent = unit.unit;
  const joinedText = unit.content.map(c => c.text).join("\n");
  document.getElementById("textInput").value = joinedText;
  currentAudioList = unit.content.map(c => c.audio);
  document.getElementById("library").classList.add("hidden");
}

const listDiv = document.getElementById("libraryList");
curriculum.forEach(unit => {
  const item = document.createElement("div");
  item.textContent = unit.unit;
  item.onclick = () => loadUnit(unit);
  listDiv.appendChild(item);
});

document.getElementById("textInput").addEventListener("click", () => {
  if (currentAudioList.length > 0) {
    const audio = document.getElementById("audioPlayer");
    audio.src = currentAudioList[0];
    audio.play();
  }
});
