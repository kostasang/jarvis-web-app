document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('new-password-form');
    const messageDiv = document.getElementById('message');
    
    // Get the token from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('verification_token');
    
    // If no token is present, show error and disable form
    if (!token) {
        messageDiv.textContent = 'Invalid or missing reset token. Please request a new password reset link.';
        messageDiv.classList.add('error');
        form.querySelectorAll('input, button').forEach(element => element.disabled = true);
        return;
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        messageDiv.classList.remove('success', 'error');

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            messageDiv.textContent = 'Passwords do not match.';
            messageDiv.classList.add('error');
            return;
        }

        // Validate password strength (add your own criteria)
        if (newPassword.length < 8) {
            messageDiv.textContent = 'Password must be at least 8 characters long.';
            messageDiv.classList.add('error');
            return;
        }

        try {
            await resetPassword(token, newPassword);

            // Show success message
            messageDiv.textContent = 'Password successfully reset. Redirecting to login...';
            messageDiv.classList.add('success');
            
            // Clear the form
            form.reset();
            
            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 3000);

        } catch (error) {
            console.error('Error:', error);
            messageDiv.textContent = 'An error occurred while resetting your password. Please try again later.';
            messageDiv.classList.add('error');
        }
    });

    // // Add password validation feedback
    // const newPasswordInput = document.getElementById('new-password');
    // newPasswordInput.addEventListener('input', function() {
    //     const password = this.value;
    //     let isValid = true;
    //     let message = '';

    //     if (password.length < 8) {
    //         isValid = false;
    //         message = 'Password must be at least 8 characters long';
    //     }
    //     // Add more password criteria as needed
    //     // Example:
    //     // if (!/[A-Z]/.test(password)) {
    //     //     isValid = false;
    //     //     message = 'Password must contain at least one uppercase letter';
    //     // }

    //     if (!isValid && password.length > 0) {
    //         messageDiv.textContent = message;
    //         messageDiv.classList.add('error');
    //     } else {
    //         messageDiv.textContent = '';
    //         messageDiv.classList.remove('error');
    //     }
    // });
});