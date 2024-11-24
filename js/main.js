let userHubs = null;
let hubId = null;

async function renameArea(clicked_button) {
    // Rename area
    let newName = prompt("Provide a new name for the area.");
    if (newName === null || newName === '' || newName === 'null') {
        alert('Invalid name');
        return;
    }
    setHubNickname(hubId, newName)
    .then(() => {
        document.getElementById('space-box-name').innerHTML = newName;
    })
    .catch((error) => {
        console.log(error);
        alert('Failed to rename area.');
    });
}

async function getHubInfo(clicked_button) {
    // Get hub information
    let hubInfo = await getHubs();
    hubInfo = hubInfo[0];
    let hubInfoString = `Hub ID: ${hubInfo.hub_id}\nHub Name: ${hubInfo.hub_nickname}`;
    alert(hubInfoString);
}

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
        let room_devices = room.querySelector('.room-devices').children;
        for (let i=0; i<room_devices.length; i++)
        {
            let device = room_devices[i].cloneNode(true);
            let device_category = config.devices[device.getAttribute('data-type')].category;
            let category_div = document.querySelector(`.device-category[id='${device_category}']`);
            category_div.appendChild(device);
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

function renameDevice(event, clicked_button)
{   
    event.stopPropagation();
    let nickname = prompt('Give device nickname');
    let device = clicked_button.closest('.device');
    let device_id = device.id;
    setDeviceNickname(device_id, nickname).
        then(() => {
            device.querySelector('.nickname-tooltip').innerHTML = "&#8226 Nickname: " + nickname;
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
    let template = document.getElementById('device-template');
    let device_box = template.content.cloneNode(true);
    device_box.querySelector('.device').id = device.device_id;
    device_box.querySelector('.device').setAttribute('data-type', device.device_type);
    device_box.querySelector('.description-tooltip').innerHTML = config.devices[device.device_type].description;
    device_box.querySelector('.nickname-tooltip').innerHTML = "&#8226 Nickname: " + String(device.device_nickname);
    device_box.querySelector('.id-tooltip').innerHTML = "&#8226 ID: " + device.device_id;
    device_box.querySelector('.time-tooltip').innerHTML = device.time.replace('T', ' ').split('.')[0];
    device_box.querySelector('.device-type').innerHTML = config.devices[device.device_type].icon;

    state_block = device_box.querySelector('.device-state');
    data_block = device_box.querySelector('.device-data');

    let device_config = config.devices[device.device_type];
    if (device_config.values === 'continuous') {
        let data = parseFloat(device.device_data).toFixed(device_config.round);
        data_block.innerHTML = String(data) + device_config.unit;
    }
    else if (device_config.values === 'binary') {
        data_block.innerHTML = device_config.valueMap[device.device_data].text;
        data_block.style.color = device_config.valueMap[device.device_data].color;
    }

    // Handle control device
    // TODO: Add more generic way to handle control devices
    if (device_config.category === 'control') {
        let controlButton = device_box.querySelector('.control-device-btn');
        if (device.device_data == 1) {
            controlButton.innerHTML = config.icons.pause;
        }
        else {
            controlButton.innerHTML = config.icons.play;
        }
    }
    return device_box;
}

function refreshDevice(device) {
    // Refresh device data, state and time
    let device_box = document.getElementById(device.device_id);
    device_box.querySelector('.time-tooltip').innerHTML = device.time.replace('T', ' ').split('.')[0];

    data_block = device_box.querySelector('.device-data');
    let device_config = config.devices[device.device_type];
    if (device_config.values === 'continuous') {
        let data = parseFloat(device.device_data).toFixed(device_config.round);
        data_block.innerHTML = String(data) + device_config.unit;
    }
    else if (device_config.values === 'binary') {
        data_block.innerHTML = device_config.valueMap[device.device_data].text;
        data_block.style.color = device_config.valueMap[device.device_data].color;
    }

    // Handle control device
    // TODO: Add more generic way to handle control devices
    if (device_config.category === 'control') {
        let controlButton = device_box.querySelector('.control-device-btn');
        if (device.device_data == 1) {
            controlButton.innerHTML = config.icons.pause;
        }
        else {
            controlButton.innerHTML = config.icons.play;
        }
    }
}

async function placeDevices() {
    // Place created devices in the DOM when starting the app
    let devices = await getDevices();
    devices = devices.sort((a, b) => a.device_id.localeCompare(b.device_id));
    for (let i=0; i<devices.length; i++)
    {
        let device = designDevice(devices[i]);
        if (devices[i].area_id === null) {
            let category = document.getElementById(config.devices[devices[i].device_type].category);
            category.appendChild(device);
        }
        else {
            let room = document.getElementById(devices[i].area_id);
            room.querySelector(".room-devices").appendChild(device);
        }
    }
}

function logTime() {
    // Log the time of the last refresh
    let time_box = document.getElementById('refresh-time');
    time_box.innerHTML = 'Last refresh: ' + new Date().toLocaleTimeString('it-IT');
}

async function refreshData(event, clickedButton) {
    getDevices()
    .then((devices) => {
        if (clickedButton !== undefined) {
            clickedButton.classList.add("pulse");
            setTimeout(() => clickedButton.classList.remove("pulse"), 400);
        }
        for (let i=0; i<devices.length; i++)
        {
            refreshDevice(devices[i]);
        }
        logTime();
    })
    .catch((error) => {
        if (clickedButton !== undefined) {
            clickedButton.classList.add("shake");
            setTimeout(() => clickedButton.classList.remove("shake"), 400);
        }
    });
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
        hubNickname = userHubs[0].hub_nickname;
        if (hubNickname === null) {
            hubNickname = 'Space Overview';
        }
        document.getElementById('space-box-name').innerHTML = hubNickname;
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