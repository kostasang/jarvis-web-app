document.addEventListener('DOMContentLoaded', function() {
    const resetForm = document.getElementById('reset-password-form');
    const messageDiv = document.getElementById('message');

    resetForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        messageDiv.classList.remove('success', 'error');

        try {
            await declareLostPassword(email);
            messageDiv.textContent = 'If an account exists for this email, you will receive password reset instructions.';
            messageDiv.classList.add('success');
            
            // Clear the form
            resetForm.reset();

        } catch (error) {
            console.error('Error:', error);
            messageDiv.textContent = 'An error occurred. Please try again later.';
            messageDiv.classList.add('error');
        }
    });
});