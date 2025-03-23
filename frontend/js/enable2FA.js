async function enable2FA() {
    let home = document.getElementById("btn-home");
    home.addEventListener("click", function() {renderPage("home");});

    const token = localStorage.getItem('access_token');

    if (!token) {
        console.error('Access token not found');
        return;
    }

    try {
        console.log('Token:', token);
        const response = await fetch('http://localhost:8000/setup_2fa/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Backend Error:', errorData);
            throw new Error('Failed to enable 2FA');
        }
        const data = await response.json();
        document.getElementById('qr-code').src = data.qrcode;
        document.getElementById('qr-code-container').style.display = 'block';
        localStorage.setItem('secret', data.secret);
        
        
    }
    catch (error) {
        console.error('Error:', error);
        document.getElementById('2fa-error-message').textContent = 'Failed to enable 2FA. Please try again.';
        document.getElementById('2fa-error-message').style.display = 'block';
    }
}



async function check_first_time_otp() {
    
    const token = localStorage.getItem('access_token');

    if (!token) {
        console.error('Access token not found');
        return;
    }

    const otpEnable = document.getElementById("otpEnable").value;

    try {
        const response = await fetch('http://localhost:8000/verify_2fa_first_time/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ otp: otpEnable }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log(result.message);
            renderPage('profile');
        } else {
            const result = await response.json();
            document.getElementById('2fa-error-message-enable').textContent = result.message;
            document.getElementById('2fa-error-message-enable').style.display = 'block';
        }
    } 
    catch (error) {
        console.error('Error:', error);
        document.getElementById('2fa-error-message-enable').textContent = 'Failed to enable 2FA. Please try again.';
        document.getElementById('2fa-error-message-enable').style.display = 'block';
    }
}