function dragDevice(event) {
    event.dataTransfer.setData('device-id', event.currentTarget.id);
    event.dataTransfer.setData('device-type', event.currentTarget.getAttribute('data-type'));
    event.currentTarget.classList.add('dragging');
}

function dragEndDevice(event) {
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
    let deviceId = event.dataTransfer.getData('device-id');
    let deviceDiv = document.getElementById(deviceId);
    let areaBox = event.currentTarget;
    let areaId = event.currentTarget.id;
    if (deviceDiv.parentElement.parentElement.id === areaId) {
        return;
    }
    assignDeviceToArea(deviceId, areaId)
    .then(() => {
        deviceDiv.parentElement.removeChild(deviceDiv);
        areaBox.querySelector('.room-devices').appendChild(deviceDiv);
        areaBox.classList.remove('droppable');
    })
}

function dropToAvailable(event) {
    event.preventDefault();
    let deviceId = event.dataTransfer.getData('device-id');
    let deviceType = event.dataTransfer.getData('device-type');
    let deviceCategory = config.devices[deviceType].category;
    let deviceDiv = document.getElementById(deviceId);
    let categoryDiv = event.currentTarget;
    if (deviceDiv.parentElement.classList.contains('device-category')) {
        return;
    }
    removeDeviceFromArea(deviceId)
    .then(() => {
        deviceDiv.parentElement.removeChild(deviceDiv);
        document.querySelector(`.device-category#${deviceCategory}`).appendChild(deviceDiv);
        categoryDiv.classList.remove('droppable');
    })
}

function initializeDragAndDrop() {
    
    let deviceTemplate = document.getElementById('device-template').content.firstElementChild.cloneNode(true);
    deviceTemplate.setAttribute("draggable", "true");
    deviceTemplate.setAttribute("ondragstart", "dragDevice(event)");
    deviceTemplate.setAttribute("ondragend", "dragEndDevice(event)");
    document.getElementById('device-template').content.firstElementChild.replaceWith(deviceTemplate);

    let roomTemplate = document.getElementById('room-template').content.firstElementChild.cloneNode(true);
    roomTemplate.setAttribute("ondragover", "dragOver(event)");
    roomTemplate.setAttribute("ondragenter", "dragEnter(event)");
    roomTemplate.setAttribute("ondragleave", "dragLeave(event)");
    roomTemplate.setAttribute("ondrop", "dropToRoom(event)");
    document.getElementById('room-template').content.firstElementChild.replaceWith(roomTemplate);


    document.getElementById("available-devices-box").addEventListener("dragover", dragOver);
    document.getElementById("available-devices-box").addEventListener("dragenter", dragEnter);
    document.getElementById("available-devices-box").addEventListener("dragleave", dragLeave);
    document.getElementById("available-devices-box").addEventListener("drop", dropToAvailable);
}