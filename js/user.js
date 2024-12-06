document.getElementById('toggle-password-change-btn').addEventListener('click', function() {
    const passwordFormContainer = document.getElementById('change-password-container');
    passwordFormContainer.classList.toggle('show');
});

document.getElementById('toggle-email-change-btn').addEventListener('click', function() {
    const emailFormContainer = document.getElementById('change-email-container');
    emailFormContainer.classList.toggle('show');
});

document.getElementById('toggle-delete-account-btn').addEventListener('click', function() {
    const deletionFormContainer = document.getElementById('delete-account-container');
    deletionFormContainer.classList.toggle('show');
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

document.getElementById('change-email-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const password = document.getElementById('current-password-email').value;
    const newEmail = document.getElementById('new-email').value;
    const messageElem = document.getElementById('email-change-message');

    // Make an API request to change the email
    try {
        const response = await changeEmail(password, newEmail);
        if (response.ok) {
            messageElem.textContent = "Check your email for a verification link.";
            messageElem.classList.add('success');
            await new Promise(r => setTimeout(r, 3000));
            location.reload();
        } else {
            messageElem.textContent = "Failed to change email. Please try again.";
            messageElem.classList.remove('success');
        }
    } catch (error) {
        console.error('Error:', error);
        messageElem.textContent = "An error occurred. Please try again later.";
        messageElem.classList.remove('success');
    }
});


document.getElementById('delete-account-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const password = document.getElementById('delete-confirm-password').value;
    const messageElem = document.getElementById('delete-account-message');

    // Make an API request to delete the user
    try {
        await deleteUser(password);
        messageElem.textContent = "Account deleted successfully! Logging out ...";
        messageElem.classList.add('success');
        await new Promise(r => setTimeout(r, 3000));
        await logOut();
        localStorage.removeItem('accessToken');
        location.href = '../index.html';
    } catch (error) {
        console.error('Error:', error);
        messageElem.textContent = "Failed to delete account. Please try again.";
        messageElem.classList.remove('success');
    }
});

async function getUserInfo() {
    userData = await me()
    .then(data => { 
        document.getElementById('user-id').innerHTML = data.user_id;
        document.getElementById('user-name').innerHTML = data.username;
        document.getElementById('user-email').innerHTML = data.email;
        document.getElementById('user-registration-date').innerHTML = data.date_registered.replace('T', ' ').split('.')[0];
    })
} 

$(async function() {
    if (localStorage.getItem('accessToken') === null) {
        location.href = '../index.html';
    }
    await getUserInfo();
});