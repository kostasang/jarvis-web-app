document.getElementById('toggle-password-change-btn').addEventListener('click', function() {
    const passwordFormContainer = document.getElementById('change-password-container');
    if (passwordFormContainer.style.display === 'none') {
        passwordFormContainer.style.display = 'block';
    } else {
        passwordFormContainer.style.display = 'none';
    }
});

document.getElementById('change-password-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const messageElem = document.getElementById('password-change-message');

    // Basic password confirmation check
    if (newPassword !== confirmPassword) {
        messageElem.textContent = "New passwords do not match.";
        messageElem.classList.remove('success');
        return;
    }

    // Make an API request to change the password
    try {
        const response = await changePassword(currentPassword, newPassword);
        if (response.ok) {
            messageElem.textContent = "Password changed successfully! Logging out ...";
            messageElem.classList.add('success');
            await new Promise(r => setTimeout(r, 3000));
            await logOut();
            localStorage.removeItem('accessToken');
            location.href = '../index.html';
        } else {
            messageElem.textContent = "Failed to change password. Please try again.";
            messageElem.classList.remove('success');
        }
    } catch (error) {
        console.error('Error:', error);
        messageElem.textContent = "An error occurred. Please try again later.";
        messageElem.classList.remove('success');
    }
});


async function getUserInfo() {
    userData = await me()
    .then(data => {
        document.getElementById('user-id').innerHTML = data.user_id;
        document.getElementById('user-name').innerHTML = data.username;
        document.getElementById('user-email').innerHTML = data.email;
        document.getElementById('user-registration-date').innerHTML = data.date_registered.replace('T', ' ');
    });
} 

$(async function() {
    if (localStorage.getItem('accessToken') === null) {
        location.href = '../index.html';
    }
    await getUserInfo();
});