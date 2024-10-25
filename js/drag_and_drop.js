function dragSensor(event) {
    
    event.dataTransfer.setData('sensor-id', event.currentTarget.id);
    event.dataTransfer.setData('sensor-type', event.currentTarget.getAttribute('data-type'));
    event.currentTarget.classList.add('dragging');
}

function dragEndSensor(event) {
    event.currentTarget.classList.remove('dragging');
}

function dragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('droppable');
}

function dragEnter(event) {
    event.preventDefault();
}

function dragLeave(event) {
    event.currentTarget.classList.remove('droppable');
}

function dropToRoom(event) {
    event.preventDefault();

    let sensorId = event.dataTransfer.getData('sensor-id');
    let sensorDiv = document.getElementById(sensorId);
    let areaBox = event.currentTarget;
    let areaId = event.currentTarget.id;
    assignDeviceToArea(sensorId, areaId)
    .then(() => {
        sensorDiv.parentElement.removeChild(sensorDiv);
        areaBox.querySelector('.room-sensors').appendChild(sensorDiv);
        areaBox.classList.remove('droppable');
    })
}

function dropToAvailable(event) {
    event.preventDefault();

    let sensorId = event.dataTransfer.getData('sensor-id');
    let sensorType = event.dataTransfer.getData('sensor-type');
    let sensorCategory = config.devices[sensorType].category;
    let sensorDiv = document.getElementById(sensorId);
    let categoryDiv = event.currentTarget;
    removeDeviceFromArea(sensorId)
    .then(() => {
        sensorDiv.parentElement.removeChild(sensorDiv);
        document.querySelector(`.sensor-category#${sensorCategory}`).appendChild(sensorDiv);
        categoryDiv.classList.remove('droppable');
    })
}
