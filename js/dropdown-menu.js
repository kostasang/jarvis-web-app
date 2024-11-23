function toggleSpaceMenu(event, optionsIcon) {
    event.stopPropagation();

    // If a device is selected, deselect it
    const selectedDevice = document.querySelector('.device.selected');
    if (selectedDevice) {
        selectedDevice.classList.remove("selected");
    }

    // Select the dropdown menu within the same room container
    const menu = optionsIcon.parentElement.nextElementSibling;
    
    document.querySelectorAll('.device-dropdown-menu').forEach(menuItem => {
        menuItem.classList.remove('show');
    });

    // Toggle the visibility of the dropdown menu
    menu.classList.toggle('show');
}


function toggleRoomMenu(event, optionsIcon) {
    event.stopPropagation();

    // If a device is selected, deselect it
    const selectedDevice = document.querySelector('.device.selected');
    if (selectedDevice) {
        selectedDevice.classList.remove("selected");
    }

    // Select the dropdown menu within the same room container
    const menu = optionsIcon.parentElement.nextElementSibling;

    // Close any other open dropdowns
    document.querySelectorAll('.room-dropdown-menu').forEach(menuItem => {
        if (menuItem !== menu) {
            menuItem.classList.remove('show');
        }
    });
    document.querySelectorAll('.device-dropdown-menu').forEach(menuItem => {
        menuItem.classList.remove('show');
    });

    // Toggle the visibility of the dropdown menu
    menu.classList.toggle('show');
}

function toggleDeviceMenu(event, optionsIcon) {
    event.stopPropagation();

    // If a device is selected, deselect it
    const selectedDevice = document.querySelector('.device.selected');
    if (selectedDevice) {
        selectedDevice.classList.remove("selected");
    }


    const menu = optionsIcon.nextElementSibling;

    // Close any other open dropdowns
    document.querySelectorAll('.device-dropdown-menu').forEach(menuItem => {
        if (menuItem !== menu) menuItem.classList.remove('show');
    });
    document.querySelectorAll('.room-dropdown-menu').forEach(menuItem => {
        menuItem.classList.remove('show');
    });

    // Toggle the visibility of the clicked dropdown menu
    menu.classList.toggle('show');
}

// Close the menus if clicking outside
document.addEventListener('click', function (event) {

    if (!event.target.closest('.space-dropdown-menu')) {
        document.querySelectorAll('.space-dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }

    if (!event.target.closest('.device-options')) {
        document.querySelectorAll('.device-dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
    if (!event.target.closest('.room-header') && !event.target.closest('.room-dropdown-menu')) {
        document.querySelectorAll('.room-dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});
