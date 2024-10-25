function dragSensor(event) {
    // Determine if it's a touch event
    if (event.type === "touchstart") {
        event = event.touches[0];  // Access the first touch point
    }
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
    // Determine if it's a touch event
    if (event.type === "touchend") {
        event = event.touches[0];  // Access the first touch point
    }

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
    if (event.type === "touchend") {
        event = event.changedTouches[0];
    }

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

function handleTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const draggedElement = document.querySelector(".dragging"); // Track the currently dragging element

    if (draggedElement) {
        draggedElement.style.left = `${touch.pageX}px`;
        draggedElement.style.top = `${touch.pageY}px`;
    }
}

// Example usage
document.addEventListener('touchmove', handleTouchMove);
