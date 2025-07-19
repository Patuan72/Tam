
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("visible");
}
function loadPage(page) {
  if (page === 'library') {
    document.getElementById("content-frame").src = '';
    document.getElementById("library-view").classList.remove("hidden");
  }
}
