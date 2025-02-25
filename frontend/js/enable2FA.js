async function enable2FA() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.error('Access token not found');
        return;
    }
    try {
        console.log('Token:', token);
        const response = await fetch('http://localhost:8000/setup-2fa/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  /// Ensure "Bearer" is included
            },
            credentials: 'include',
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Backend Error:', errorData);  // Debugging
            throw new Error('Failed to enable 2FA');
        }
        const data = await response.json();
        document.getElementById('qr-code').src = data.qr_code;
        document.getElementById('qr-code-container').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('2fa-error-message').textContent = 'Failed to enable 2FA. Please try again.';
        document.getElementById('2fa-error-message').style.display = 'block';
    }
}