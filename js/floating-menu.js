// Toggle side panel on hamburger menu click
document.getElementById('hamburger-menu').addEventListener('click', function() {
    const sidePanel = document.getElementById('side-panel');
    const overlay = document.getElementById('overlay');
    sidePanel.classList.toggle('open');
    overlay.classList.toggle('show');
});

// Close side panel when overlay is clicked
document.getElementById('overlay').addEventListener('click', function() {
    const sidePanel = document.getElementById('side-panel');
    const overlay = document.getElementById('overlay');
    sidePanel.classList.remove('open');
    overlay.classList.remove('show');
});