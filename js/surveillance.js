function createCameraElement(camera) {
    // Create a new camera element
    let camera_box = document.getElementById('camera-template');
    camera_box = camera_box.content.cloneNode(true);
    camera_box.querySelector('.camera-box').id = camera.camera_id;
    camera_box.querySelector('.camera-name-overlay').innerText = camera.camera_nickname;
    camera_box.querySelector('.camera-stream').src = config.webrtcBaseUrl + '/' + camera.camera_id + '/?token=' + localStorage.getItem('accessToken');
    return camera_box;
}

function claimCameraButton() {
    // Claim a camera
    Swal.fire({
        title: 'Claim Camera',
        html: `
            <input type="text" id="camera-id" class="swal2-input" placeholder="Camera ID">
            <input type="password" id="camera-password" class="swal2-input" placeholder="Camera Password">
            <input type="text" id="camera-nickname" class="swal2-input" placeholder="Camera Name">
        `,
        confirmButtonText: 'Claim',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        preConfirm: () => {
            const cameraId = Swal.getPopup().querySelector('#camera-id').value;
            const cameraPassword = Swal.getPopup().querySelector('#camera-password').value;
            const cameraNickname = Swal.getPopup().querySelector('#camera-nickname').value;
            if (!cameraId || !cameraPassword || !cameraNickname) {
                Swal.showValidationMessage(`Please fill in all fields`);
            }
            return { cameraId, cameraPassword, cameraNickname };
        },
        backdrop: true, // Dimmed background for focus
    }).then((result) => {
        if (result.isConfirmed) {
            claimCamera(result.value.cameraId, result.value.cameraPassword, result.value.cameraNickname)
            .then((response) => {
                Swal.fire({
                    icon: 'success',
                    title: 'Camera claimed successfully'
                });
                camera = {
                    camera_id: result.value.cameraId,
                    camera_nickname: result.value.cameraNickname
                }
                cameraElement = createCameraElement(camera);
                document.getElementById('camera-panel').appendChild(cameraElement);
            })
            .catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to claim camera',
                    text: error.message
                });
            });
        } else if (result.isDismissed) {
            console.log('Camera claim cancelled.');
        }
    });
}

async function createQRCode(ssid, password, encryption, hidden) {
    return new Promise((resolve, reject) => {
        // Create Wi-Fi QR code string
        const wifiString = `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden};`;

        // Generate QR code
        QRCode.toCanvas(
            wifiString,
            { errorCorrectionLevel: 'H', width: 300 },
            (err, canvas) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                // Convert canvas to Data URL
                const qrDataUrl = canvas.toDataURL();
                resolve(qrDataUrl);
            }
        );
    });
}

function setupCameraButton() {
    // Setup qr code with wifi credentials for camera
    // Get wifi ssid (name) and wifi password with swal
    Swal.fire({
        title: 'Setup Camera',
        html: `
            <input type="text" id="wifi-ssid" class="swal2-input" placeholder="WiFi Name">
            <input type="password" id="wifi-password" class="swal2-input" placeholder="WiFi Password">
        `,
        confirmButtonText: 'Generate QR Code',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        preConfirm: () => {
            const wifiSsid = Swal.getPopup().querySelector('#wifi-ssid').value;
            const wifiPassword = Swal.getPopup().querySelector('#wifi-password').value;
            if (!wifiSsid || !wifiPassword) {
                Swal.showValidationMessage(`Please fill in all fields`);
            }
            return { wifiSsid, wifiPassword };
        },
        backdrop: true, // Dimmed background for focus
    }).then((result) => {
        if (result.isConfirmed) {
            createQRCode(result.value.wifiSsid, result.value.wifiPassword, 'WPA', false)
            .then((qrCodeDataUrl) => {
                Swal.fire({
                    icon: 'success',
                    title: 'Camera setup successful',
                    html: `
                        <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 200px; height: 200px;">
                    `
                });
            })
            .catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to setup camera',
                    text: error.message
                });
            });
        } else if (result.isDismissed) {
            console.log('Camera setup cancelled.');
        }
    });
}

function renameCameraButton(event, clickElement) {
    const cameraId = clickElement.parentElement.parentElement.id;
    Swal.fire({
        title: 'Rename Camera',
        html: `
            <input type="text" id="camera-nickname" class="swal2-input" placeholder="Camera Name">
        `,
        confirmButtonText: 'Rename',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        preConfirm: () => {
            const cameraNickname = Swal.getPopup().querySelector('#camera-nickname').value;
            if (!cameraNickname) {
                Swal.showValidationMessage(`Please fill in all fields`);
            }
            return { cameraNickname };
        },
        backdrop: true, // Dimmed background for focus
    }).then((result) => {
        if (result.isConfirmed) {
            setCameraNickname(cameraId, result.value.cameraNickname)
            .then((response) => {
                document.getElementById(cameraId).querySelector('.camera-name-overlay').innerText = result.value.cameraNickname;
                Swal.fire({
                    icon: 'success',
                    title: 'Camera renamed successfully!',
                });
            })
            .catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to rename camera',
                    text: error.message
                });
            });
        } else if (result.isDismissed) {
            console.log('Camera rename cancelled.');
        }
    });
}

function unclaimCameraButton(event, clickElement) {
    const cameraId = clickElement.parentElement.parentElement.id;
    Swal.fire({
        title: 'Unclaim Camera',
        text: 'Are you sure you want to unclaim this camera?',
        showCancelButton: true,
        confirmButtonText: 'Unclaim',
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        backdrop: true, // Dimmed background for focus
    }).then((result) => {
        if (result.isConfirmed) {
            unclaimCamera(cameraId)
            .then((response) => {
                document.getElementById(cameraId).remove();
                Swal.fire({
                    icon: 'success',
                    title: 'Camera unclaimed successfully!',
                });
            })
            .catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to unclaim camera',
                    text: error.message
                });
            });
        } else if (result.isDismissed) {
            console.log('Camera unclaim cancelled.');
        }
    });
}

function cameraInfoButton(event, clickElement) {
    const cameraId = clickElement.parentElement.parentElement.id;
    const cameraNickename = clickElement.parentElement.parentElement.querySelector('.camera-name-overlay').innerText;
    Swal.fire({
        title: 'Camera Information',
        html: `
            <b>Camera Name:</b> ${cameraNickename}<br><br>
            <b>Camera ID:</b> ${cameraId}<br>
        `,
        confirmButtonText: 'Close',
        backdrop: true, // Dimmed background for focus
    });
}

function toggleCameraDropdown(event, iconElement) {
    event.preventDefault();
    event.stopPropagation();
    const dropdownMenu = iconElement.nextElementSibling;
    dropdownMenu.classList.toggle('show');

    // Close any other open dropdowns
    document.querySelectorAll('.camera-dropdown-menu').forEach(menuItem => {
        if (menuItem !== dropdownMenu) {
            menuItem.classList.remove('show');
        }
    });
}

document.addEventListener('click', function (event) {
    // Close the menus if clicking outside
    if (!event.target.closest('.camera-dropdown-menu')) {
        document.querySelectorAll('.camera-dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});


$(async function() {

    let userCameras = await getCameras();
    for (let i=0; i<userCameras.length; i++) {
        let camera = userCameras[i];
        let cameraElement = createCameraElement(camera);
        document.getElementById('camera-panel').appendChild(cameraElement);
    }

    // Periodically call the api every 5 sec to force logout in case of token expiry
    setInterval(async function() {
        await me();
    }, 5000);
});
