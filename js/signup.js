document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    
    const username = document.getElementById('username').value;
    const email= document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const captcha = grecaptcha.getResponse();

    // Validate the CAPTCHA
    if (!captcha) {
        document.getElementById('msg').style.color = 'red';
        document.getElementById('msg').innerText = 'Please complete the CAPTCHA.';
        return;
    }

    if (password !== confirmPassword) {
        document.getElementById('msg').style.color = 'red';
        document.getElementById('msg').innerText = 'Passwords do not match.';
        return;
    }

    // Validate password strength (add your own criteria)
    if (password.length < 8) {
        document.getElementById('msg').style.color = 'red';
        document.getElementById('msg').innerText = 'Password needs to be at least 8 characters long.';
        return;
    }

    // Assuming the API endpoint is something like https://api.example.com/login
    const apiUrl = config.apiBaseUrl + '/create_user';

    // Create the payload
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    params.append('email', email);
    params.append('captcha', captcha);

    // Send the login data to the API
    fetch(`${apiUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.detail);
            });
        }
    })
    .then(data => {
        // Handle successful login here
        document.getElementById('msg').style.color = 'green';
        document.getElementById('msg').innerText = 'Verification email sent. Please check your email.';
        // Redirect to login after a brief delay
        setTimeout(() => {
            window.location.href = "../index.html"; // Adjust the URL as needed
        }, 3000); // 3-second delay
    })
    .catch(error => {
        // Handle any errors that occur during the fetch
        document.getElementById('msg').style.color = 'red';
        document.getElementById('msg').innerText = error.message;
    });
});