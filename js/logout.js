async function logOutButton() {
    // Logout
    logOut()
    .then(() => {
        localStorage.removeItem('accessToken');
    });
}