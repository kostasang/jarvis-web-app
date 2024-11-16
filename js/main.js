let userHubs = null;
let hubId = null;

async function renameRoom(clicked_button) {
    // Rename room
    let new_name = prompt("Provide a new name for the room.");
    if (new_name === null || new_name === '' || new_name === 'null') {
        alert('Invalid name');
        return;
    }
    let room = clicked_button.closest('.room');
    let room_id = room.id;
    renameArea(hubId, room_id, new_name)
    .then(() => {
        room.querySelector('.room-title').innerHTML = new_name;
    })
    .catch((error) => {
        alert('Failed to rename room.');
    });
}

async function removeRoom(clicked_button) {
    // Remove room from the DOM
    let room = clicked_button.closest('.room');

    let room_id = room.id;
    deleteArea(hubId, room_id)
    .then(() => {
        let room_sensors = room.querySelector('.room-sensors').children;
        for (let i=0; i<room_sensors.length; i++)
        {
            let sensor = room_sensors[i].cloneNode(true);
            let sensor_category = config.devices[sensor.getAttribute('data-type')].category;
            let category_div = document.querySelector(`.sensor-category[id='${sensor_category}']`);
            category_div.appendChild(sensor);
        }
        room.parentElement.removeChild(room);
    })
    .catch((error) => {
        alert('Failed to remove room!');
    });
}

async function addRoom() {
    let name = prompt('Provide a room name.');
    if (name === null || name === '' || name === 'null') {
        alert('Invalid name');
        return;
    }
    createArea(hubId, name)
    .then((response) => {
        let rooms_div = document.getElementById('rooms-box');
        let room_box = document.getElementById('room-template');
        room_box = room_box.content.cloneNode(true);
        room_box.querySelector('.room').id = response.area_id;
        room_box.querySelector('.room-title').innerHTML = response.area_name;
        rooms_div.appendChild(room_box);
    })
    .catch((error) => {
        alert('Failed to create room, room already exists!');
    });
}

function renameSensor(clicked_button)
{   
    let nickname = prompt('Give sensor nickname');
    let sensor = clicked_button.closest('.sensor');
    let sensor_id = sensor.id;
    setDeviceNickname(sensor_id, nickname).
        then(() => {
            sensor.querySelector('.nickname-tooltip').innerHTML = "&#8226 Nickname: " + nickname;
        })
}

async function placeRooms() {
    // Place created rooms in the DOM when starting the app
    let room_box = document.getElementById('rooms-box');
    let rooms = await getRooms(hubId);
    rooms = rooms.sort((a, b) => a.area_name.localeCompare(b.area_name));
    for (let i=0; i<rooms.length; i++)
    {
        let template = document.getElementById('room-template');
        let room = template.content.cloneNode(true);
        room.querySelector('.room-title').innerHTML = rooms[i].area_name;
        room.querySelector('.room').id = rooms[i].area_id;
        room_box.appendChild(room);
    }
}

function designDevice(device) {
    // Deisng the details of the device
    let template = document.getElementById('sensor-template');
    let device_box = template.content.cloneNode(true);
    device_box.querySelector('.sensor').id = device.sensor_id;
    device_box.querySelector('.sensor').setAttribute('data-type', device.sensor_type);
    device_box.querySelector('.description-tooltip').innerHTML = config.devices[device.sensor_type].description;
    device_box.querySelector('.nickname-tooltip').innerHTML = "&#8226 Nickname: " + String(device.sensor_nickname);
    device_box.querySelector('.id-tooltip').innerHTML = "&#8226 ID: " + device.sensor_id;
    device_box.querySelector('.time-tooltip').innerHTML = device.last_timestamp.replace('T', ' ');
    device_box.querySelector('.sensor-type').innerHTML = config.devices[device.sensor_type].icon;

    state_block = device_box.querySelector('.sensor-state');
    data_block = device_box.querySelector('.sensor-data');

    let device_config = config.devices[device.sensor_type];
    if (device_config.values === 'continuous') {
        let data = parseFloat(device.sensor_data).toFixed(device_config.round);
        data_block.innerHTML = String(data) + device_config.unit;
    }
    else if (device_config.values === 'binary') {
        data_block.innerHTML = device_config.valueMap[device.sensor_data].text;
        data_block.style.color = device_config.valueMap[device.sensor_data].color;
    }

    // Handle control device
    // TODO: Add more generic way to handle control devices
    if (device_config.category === 'control') {
        let controlButton = device_box.querySelector('.control-sensor-btn');
        if (device.sensor_data == 1) {
            controlButton.innerHTML = config.icons.stop;
        }
        else {
            controlButton.innerHTML = config.icons.play;
        }
    }
    return device_box;
}

function refreshDevice(device) {
    // Refresh device data, state and time
    let device_box = document.getElementById(device.sensor_id);
    device_box.querySelector('.time-tooltip').innerHTML = device.last_timestamp.replace('T', ' ');

    data_block = device_box.querySelector('.sensor-data');
    let device_config = config.devices[device.sensor_type];
    if (device_config.values === 'continuous') {
        let data = parseFloat(device.sensor_data).toFixed(device_config.round);
        data_block.innerHTML = String(data) + device_config.unit;
    }
    else if (device_config.values === 'binary') {
        data_block.innerHTML = device_config.valueMap[device.sensor_data].text;
        data_block.style.color = device_config.valueMap[device.sensor_data].color;
    }

    // Handle control device
    // TODO: Add more generic way to handle control devices
    if (device_config.category === 'control') {
        let controlButton = device_box.querySelector('.control-sensor-btn');
        if (device.sensor_data == 1) {
            controlButton.innerHTML = config.icons.stop;
        }
        else {
            controlButton.innerHTML = config.icons.play;
        }
    }
}

async function placeDevices() {
    // Place created sensors in the DOM when starting the app
    let devices = await getDevices();
    devices = devices.sort((a, b) => a.sensor_id.localeCompare(b.sensor_id));
    for (let i=0; i<devices.length; i++)
    {
        let device = designDevice(devices[i]);
        if (devices[i].area_id === null) {
            let category = document.getElementById(config.devices[devices[i].sensor_type].category);
            category.appendChild(device);
        }
        else {
            let room = document.getElementById(devices[i].area_id);
            room.querySelector(".room-sensors").appendChild(device);
        }
    }
}

function logTime() {
    // Log the time of the last refresh
    let time_box = document.getElementById('refresh-time');
    time_box.innerHTML = 'Last refresh: ' + new Date().toLocaleTimeString('it-IT');
}

async function refreshData() {
    // Refresh the data of the sensors
    let devices = await getDevices();
    for (let i=0; i<devices.length; i++)
    {
        refreshDevice(devices[i]);
    }
    logTime();
}

function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

async function hubClaimingLoop() {
    let success = false;
    do {
        hubId = prompt("You have no claimed hubs. Enter your hub's ID.");
        if (!hubId) {
            alert('Invalid hub ID');
            continue;
        }
        const verificationCode = prompt("Enter your hub's verification code.");
        if (!verificationCode) {
            alert('Invalid verification code');
            continue;
        }
        try {
            await claimHub(hubId, verificationCode);
            alert('Hub claimed successfully!');
            success = true;
        } catch (error) {
            alert('Failed to claim hub, try again');
        }
    } while (!success);
}

$(async function() {
    
    if (isMobileDevice()) {
        initializeTapToSelect();
    } else {
        initializeDragAndDrop();
    }

    if (localStorage.getItem('accessToken') === null) {
        location.href = '../index.html';
    }

    userHubs = await getHubs();
    if (userHubs.length === 0) {
        await hubClaimingLoop();
    }
    else {
        hubId = userHubs[0].hub_id;
    }

    await placeRooms();
    await placeDevices();
    logTime();

    /* Websocket method */

    const ws = new WebSocket(
        `${config.websockerBaseUrl}/get_live_notifications?token=${localStorage.getItem('accessToken')}`
    );

    ws.onopen = function(event) {
        console.log("WebSocket connection established");
    };
    
    ws.onmessage = function(event) {
        console.log("Message from server: ", event.data);
        refreshData();
    };
    
    ws.onclose = function(event) {
        console.log("Disconnected from WebSocket server");
        logOut()
        .then(() => {
            localStorage.removeItem('accessToken');
            location.href = '../index.html';
        });
    };
    
    ws.onerror = function(error) {
        console.error("WebSocket error: ", error);
        /* Long polling method if websocker fails*/
        setInterval(function() {
            refreshData();
        },
        config.refreshTime);
    };
});