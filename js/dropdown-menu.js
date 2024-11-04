function toggleRoomMenu(event, optionsIcon) {
    event.stopPropagation();

    // If a sensor is selected, deselect it
    const selectedSensor = document.querySelector('.sensor.selected');
    if (selectedSensor) {
        selectedSensor.classList.remove("selected");
    }

    // Select the dropdown menu within the same room container
    const menu = optionsIcon.parentElement.nextElementSibling;

    // Close any other open dropdowns
    document.querySelectorAll('.room-dropdown-menu').forEach(menuItem => {
        if (menuItem !== menu) menuItem.style.display = 'none';
    });

    // Toggle the visibility of the dropdown menu
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

function toggleSensorMenu(event, optionsIcon) {
    event.stopPropagation();

    // If a sensor is selected, deselect it
    const selectedSensor = document.querySelector('.sensor.selected');
    if (selectedSensor) {
        selectedSensor.classList.remove("selected");
    }


    const menu = optionsIcon.nextElementSibling;
    // Close any other open dropdowns
    document.querySelectorAll('.sensor-dropdown-menu').forEach(menuItem => {
        if (menuItem !== menu) menuItem.style.display = 'none';
    });

    // Toggle the visibility of the clicked dropdown menu
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

// Close the menus if clicking outside
document.addEventListener('click', function (event) {
    if (!event.target.closest('.sensor-options')) {
        document.querySelectorAll('.sensor-dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
    if (!event.target.closest('.room-header') && !event.target.closest('.room-dropdown-menu')) {
        document.querySelectorAll('.room-dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});
