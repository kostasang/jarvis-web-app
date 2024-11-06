let selectedSensor = null;

function selectSensor(event) {
    event.stopPropagation();

    // Close dropdown menus
    document.querySelectorAll('.sensor-dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
    });
    document.querySelectorAll('.room-dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
    });

    if (selectedSensor && selectedSensor !== event.currentTarget) {
        // Deselect if another sensor was previously selected
        selectedSensor.classList.remove("selected");
    }
    selectedSensor = event.currentTarget;
    if (selectedSensor.classList.contains("selected")) {
        selectedSensor.classList.remove("selected");
        selectedSensor = null;
        return;
    }
    selectedSensor.classList.add("selected");
}

function moveToRoom(event) {
    if (!selectedSensor) return;

    let sensorId = selectedSensor.id;
    let sensorDiv = document.getElementById(sensorId);
    let areaBox = event.currentTarget;
    let areaId = event.currentTarget.id;
    if (sensorDiv.parentElement.parentElement.id === areaId) {
        sensorDiv.classList.remove('selected');
        selectedSensor = null;
        return;
    }
    assignDeviceToArea(sensorId, areaId)
    .then(() => {
        sensorDiv.parentElement.removeChild(sensorDiv);
        areaBox.querySelector('.room-sensors').appendChild(sensorDiv);
        sensorDiv.classList.remove('selected');
        selectedSensor = null;
    })
}

function moveToAvailable(event) {
    if (!selectedSensor) return;

    let sensorId = selectedSensor.id;
    let sensorType = selectedSensor.getAttribute('data-type');
    let sensorCategory = config.devices[sensorType].category;
    let sensorDiv = document.getElementById(sensorId);
    if (sensorDiv.parentElement.classList.contains('sensor-category')) {
        sensorDiv.classList.remove('selected');
        selectedSensor = null;
        return;
    }
    removeDeviceFromArea(sensorId)
    .then(() => {
        sensorDiv.parentElement.removeChild(sensorDiv);
        document.querySelector(`.sensor-category#${sensorCategory}`).appendChild(sensorDiv);
        sensorDiv.classList.remove('selected');
        selectedSensor = null;
    })
}

function initializeTapToSelect() {
    // Initialize the tap to select feature
    let sensorTemplate = document.getElementById('sensor-template').content.firstElementChild.cloneNode(true);
    sensorTemplate.setAttribute("onclick", "selectSensor(event)");
    document.getElementById('sensor-template').content.firstElementChild.replaceWith(sensorTemplate);

    let roomTemplate = document.getElementById('room-template').content.firstElementChild.cloneNode(true);
    roomTemplate.setAttribute("onclick", "moveToRoom(event)");
    document.getElementById('room-template').content.firstElementChild.replaceWith(roomTemplate);


    document.getElementById("available-sensors-box").addEventListener("click", moveToAvailable);
}