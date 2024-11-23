let selectedDevice = null;

function selectDevice(event) {
    event.stopPropagation();

    // Close dropdown menus
    document.querySelectorAll('.device-dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
    document.querySelectorAll('.room-dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });

    if (selectedDevice && selectedDevice !== event.currentTarget) {
        // Deselect if another device was previously selected
        selectedDevice.classList.remove("selected");
    }
    selectedDevice = event.currentTarget;
    if (selectedDevice.classList.contains("selected")) {
        selectedDevice.classList.remove("selected");
        selectedDevice = null;
        return;
    }
    selectedDevice.classList.add("selected");
}

function moveToRoom(event) {
    if (!selectedDevice) return;

    let deviceId = selectedDevice.id;
    let deviceDiv = document.getElementById(deviceId);
    let areaBox = event.currentTarget;
    let areaId = event.currentTarget.id;
    if (deviceDiv.parentElement.parentElement.id === areaId) {
        deviceDiv.classList.remove('selected');
        selectedDevice = null;
        return;
    }
    assignDeviceToArea(deviceId, areaId)
    .then(() => {
        deviceDiv.parentElement.removeChild(deviceDiv);
        areaBox.querySelector('.room-devices').appendChild(deviceDiv);
        deviceDiv.classList.remove('selected');
        selectedDevice = null;
    })
}

function moveToAvailable(event) {
    if (!selectedDevice) return;

    let deviceId = selectedDevice.id;
    let deviceType = selectedDevice.getAttribute('data-type');
    let deviceCategory = config.devices[deviceType].category;
    let deviceDiv = document.getElementById(deviceId);
    if (deviceDiv.parentElement.classList.contains('device-category')) {
        deviceDiv.classList.remove('selected');
        selectedDevice = null;
        return;
    }
    removeDeviceFromArea(deviceId)
    .then(() => {
        deviceDiv.parentElement.removeChild(deviceDiv);
        document.querySelector(`.device-category#${deviceCategory}`).appendChild(deviceDiv);
        deviceDiv.classList.remove('selected');
        selectedDevice = null;
    })
}

function initializeTapToSelect() {
    // Initialize the tap to select feature
    let deviceTemplate = document.getElementById('device-template').content.firstElementChild.cloneNode(true);
    deviceTemplate.setAttribute("onclick", "selectDevice(event)");
    document.getElementById('device-template').content.firstElementChild.replaceWith(deviceTemplate);

    let roomTemplate = document.getElementById('room-template').content.firstElementChild.cloneNode(true);
    roomTemplate.setAttribute("onclick", "moveToRoom(event)");
    document.getElementById('room-template').content.firstElementChild.replaceWith(roomTemplate);


    document.getElementById("available-devices-box").addEventListener("click", moveToAvailable);
}