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
        if (response.status === 401) { 
            // If unauthorized, redirect to login
            localStorage.removeItem('accessToken');
            window.location.href = '../index.html';
            return null;
        }
        if (!response.ok) {
            throw new Error('Failed to get devices.');
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
    const apiUrl = config.apiBaseUrl + '/get_devices_latest_data';
    return fetch(apiUrl, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (response.status === 401) { 
            // If unauthorized, redirect to login
            localStorage.removeItem('accessToken');
            window.location.href = '../index.html';
            return null;
        }
        if (!response.ok) {
            throw new Error('Failed to get devices.');
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
    params.append('device_id', device_id);
    params.append('device_nickname', nickname);

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
    params.append('device_id', device_id);
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
    params.append('device_id', device_id);
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

async function logOut() {
    const apiUrl = config.apiBaseUrl + '/logout';
    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => { 
        if (!response.ok) {
            throw new Error('Failed to log out.');
        }
        return;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


async function me() {
    const apiUrl = config.apiBaseUrl + '/me';
    return fetch(apiUrl, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (response.status === 401) {
            localStorage.removeItem('accessToken');
            window.location.href = '../index.html';
            return null;
        }
        if (!response.ok) {
            throw new Error('Failed to get user info.');
        }
        return response.json();
    })
}

async function changePassword(currentPassword, newPassword) {
    const apiUrl = config.apiBaseUrl + '/update_password';
    const params = new URLSearchParams();
    params.append('current_password', currentPassword);
    params.append('new_password', newPassword);
    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'PUT',
        headers: {
            'accept': '*/*',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to change password.');
        }
        return response;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function changeEmail(password, newEmail) {
    const apiUrl = config.apiBaseUrl + '/update_email';
    const params = new URLSearchParams();
    params.append('password', password);
    params.append('new_email', newEmail);
    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'PUT',
        headers: {
            'accept': '*/*',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to change email.');
        }
        return response;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function deleteUser(password) {
    const apiUrl = config.apiBaseUrl + '/delete_user';
    const params = new URLSearchParams();
    params.append('password', password);
    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'DELETE',
        headers: {
            'accept': '*/*',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete user.');
        }
    })
}

async function claimHub(hubId, verificationCode) {
    const apiUrl = config.apiBaseUrl + '/claim_hub';
    const params = new URLSearchParams();
    params.append('hub_id', hubId);
    params.append('verification_code', verificationCode.toString());
    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.detail); // Throw with the detail message
            });
        }
    })
}


async function declareLostPassword(email) {
    const apiUrl = config.apiBaseUrl + '/declare_lost_password';
    const params = new URLSearchParams();
    params.append('email', email);
    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
            'accept': '*/*'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.detail); // Throw with the detail message
            });
        }
    })
}

async function resetPassword(verificationToken, newPassword) {
    const apiUrl = config.apiBaseUrl + '/reset_password';
    const params = new URLSearchParams();
    params.append('verification_token', verificationToken);
    params.append('new_password', newPassword);
    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'PUT',
        headers: {
            'accept': '*/*'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.detail); // Throw with the detail message
            });
        }
    })
}


async function commandDevice(deviceId, deviceData, deviceState) {
    const apiUrl = config.apiBaseUrl + '/command_device';
    const params = new URLSearchParams();
    params.append('device_id', deviceId);
    params.append('device_data', deviceData);
    params.append('device_state', deviceState);
    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.detail); // Throw with the detail message
            });
        }
    })
}

async function setHubNickname(hubId, nickname) {
    const apiUrl = config.apiBaseUrl + '/set_hub_nickname';
    const params = new URLSearchParams();
    params.append('hub_id', hubId);
    params.append('hub_nickname', nickname);
    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.detail); // Throw with the detail message
            });
        }
    })
}

async function getDeviceHistory(deviceId, timeWindow) {
    const apiUrl = config.apiBaseUrl + '/get_device_history';
    const params = new URLSearchParams();
    params.append('device_id', deviceId);
    params.append('time_window', timeWindow);
    return fetch(`${apiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}