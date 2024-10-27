document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Assuming the API endpoint is something like https://api.example.com/login
    const apiUrl = config.apiBaseUrl + '/token';

    // Create the payload
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    params.append('grant_type', 'password');

    // Send the login data to the API
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString(),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed.'); // If the response is not OK, throw an error
        }
        return response.json(); // Parse the response as JSON
    })
    .then(data => {
        // Handle successful login here
        console.log('Login successful:', data);
        const token = data.access_token;
        localStorage.setItem('accessToken', token);
        window.location.href = 'html/main.html';
    })
    .catch(error => {
        // Handle any errors that occur during the fetch
        console.error('Error:', error);
        document.getElementById('error-message').innerText = 'Login failed. Please check your credentials.';
    });
});

document.getElementById("signup-btn").addEventListener("click", function() {
    window.location.href = "html/signup.html";
});