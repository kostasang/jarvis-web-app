function commandDeviceButton(event, clickedButton) {
    event.stopPropagation();

    const device = clickedButton.parentElement;
    const deviceId = device.getAttribute('id');
    const currentValue = device
        .querySelector('.device-content')
        .querySelector('.device-data-state')
        .querySelector('.device-data')
        .innerHTML;

    // If a device is selected, deselect it
    const selectedDevice = document.querySelector('.device.selected');
    if (selectedDevice) {
        selectedDevice.classList.remove("selected");
    }
    // Close any other open dropdowns
    document.querySelectorAll('.room-dropdown-menu').forEach(menuItem => {
        menuItem.classList.remove('show');
    });
    document.querySelectorAll('.device-dropdown-menu').forEach(menuItem => {
        menuItem.classList.remove('show');
    });

    transmittedValue = (currentValue == 'On') ? 0 : 1;
    // Send the command to the server
    commandDevice(deviceId, transmittedValue, 0)
    .then(() => {
        // Animation for transition
        clickedButton.classList.add("pulse");
        setTimeout(() => clickedButton.classList.remove("pulse"), 400);
        // Get the new device data after the command is sent
        setTimeout(() => {refreshData()}, 1500);
    })
    .catch((error) => {
        // Animation for error
        clickedButton.classList.add("shake");
        setTimeout(() => clickedButton.classList.remove("shake"), 300);
    });
}