function toggleRoomMenu(optionsIcon) {
    // Select the dropdown menu within the same room container
    const menu = optionsIcon.parentElement.nextElementSibling;

    // Close any other open dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(menuItem => {
        if (menuItem !== menu) menuItem.style.display = 'none';
    });

    // Toggle the visibility of the dropdown menu
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

// Close the menu if clicking outside
document.addEventListener('click', function (event) {
    if (!event.target.closest('.room-header') && !event.target.closest('.dropdown-menu')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});
