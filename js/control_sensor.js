function commandDeviceButton(event, clickedButton) {
    event.stopPropagation();

    const device = clickedButton.parentElement;
    const deviceId = device.getAttribute('id');
    const currentValue = device
        .querySelector('.sensor-content')
        .querySelector('.sensor-data-state')
        .querySelector('.sensor-data')
        .innerHTML;

    // If a sensor is selected, deselect it
    const selectedSensor = document.querySelector('.sensor.selected');
    if (selectedSensor) {
        selectedSensor.classList.remove("selected");
    }
    // Close any other open dropdowns
    document.querySelectorAll('.room-dropdown-menu').forEach(menuItem => {
        menuItem.classList.remove('show');
    });
    document.querySelectorAll('.sensor-dropdown-menu').forEach(menuItem => {
        menuItem.classList.remove('show');
    });

    transmittedValue = (currentValue == 'On') ? 0 : 1;
    // Send the command to the server
    commandDevice(deviceId, transmittedValue, 0)
    .then(() => {
        // Animation for transition
        device.classList.add("pulse");
        setTimeout(() => device.classList.remove("pulse"), 400);
        // Get the new sensor data after the command is sent
        setTimeout(() => {refreshData()}, 1500);
    })
    .catch((error) => {
        // Animation for error
        device.classList.add("shake");
        setTimeout(() => device.classList.remove("shake"), 300);
    });
}