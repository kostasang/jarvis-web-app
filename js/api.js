const token = localStorage.getItem('accessToken');

async function getHubs() {
    const apiUrl = config.apiBaseUrl + '/get_hubs';
    return fetch(apiUrl, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to get hubs.');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function getRooms(hub_id) {
    const params = new URLSearchParams();
    params.append('hub_id', hub_id);
    const apiUrl = config.apiBaseUrl + '/get_areas';

    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to get areas.');
        }
        return areas = response.json();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function getDevices() {
    const apiUrl = config.apiBaseUrl + '/get_devices_data';
    return fetch(apiUrl, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to get areas.');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function setDeviceNickname(device_id, nickname) {
    const apiUrl = config.apiBaseUrl + '/set_device_nickname';
    const params = new URLSearchParams();
    params.append('sensor_id', device_id);
    params.append('sensor_nickname', nickname);

    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to set device nickname.');
        }
        return;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function createArea(hub_id, area_name) {
    // Create the desired area
    const apiUrl = config.apiBaseUrl + '/create_area';
    const params = new URLSearchParams();
    params.append('hub_id', hub_id);
    params.append('area_name', area_name);

    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create area.');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function deleteArea(hub_id, area_id) {
    // Delete the given area
    const apiUrl = config.apiBaseUrl + '/delete_area';
    const params = new URLSearchParams();
    params.append('hub_id', hub_id);
    params.append('area_id', area_id);

    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'DELETE',
        headers: {
            'accept': '*/*',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create area.');
        }
        return;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function renameArea(hub_id, area_id, new_area_name) {
    // Rename the given area
    const apiUrl = config.apiBaseUrl + '/rename_area';
    const params = new URLSearchParams();
    params.append('hub_id', hub_id);
    params.append('area_id', area_id);
    params.append('new_area_name', new_area_name);

    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'PUT',
        headers: {
            'accept': '*/*',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to rename area.');
        }
        return;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function assignDeviceToArea(device_id, area_id) {
    // Assign the given device to the given area
    const apiUrl = config.apiBaseUrl + '/assign_device_to_area';
    const params = new URLSearchParams();
    params.append('sensor_id', device_id);
    params.append('area_id', area_id);
    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to assign device to area.');
        }
        return;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function removeDeviceFromArea(device_id) {
    // Remove the given device from its assigned area
    const apiUrl = config.apiBaseUrl + '/remove_device_from_area';
    const params = new URLSearchParams();
    params.append('sensor_id', device_id);
    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'DELETE',
        headers: {
            'accept': '*/*',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to remove device from area.');
        }
        return;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}