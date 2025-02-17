
const chat = function (){
    // const roomName = 'myRoom';
    // const socket = new WebSocket('wss://localhost:8001/ws/chat/myRoom/');
    
    // console.log(window.location.host)
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))
    const form = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatWindow = document.getElementById('chat-window');
    const friends = session_user.friends
    if (friends && friends.length > 0) {
        friends.forEach(friend => {
            const friends_list = document.getElementById('list-group');
            const friendItem = document.createElement("li");
            friendItem.textContent = `${friend.username}`;
            friends_list.appendChild(friendItem);
            console.log(friend)
     });
    } else {
        const friends_list = document.getElementById('list-group');
        const friendItem = document.createElement("li");
        friendItem.textContent = 'You have no friends :(';
        friends_list.appendChild(friendItem);
    }
    // Handle message submission
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent page reload
        const message = messageInput.value.trim();
        console.log(message);
        
        if (message) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');  // Optionally add a class to style it
            messageDiv.innerHTML = `<span class="user">${session_user.username}:</span> <span class="text">${message}</span>`;
            chatWindow.appendChild(messageDiv);  // Append the message div to the chat window
            chatWindow.scrollTop = chatWindow.scrollHeight;  // Scroll to the latest message
            
            messageInput.value = ''; // Clear the input field after sending
        }
    });
        // if (message) {
        //     socket.send(JSON.stringify({ message }));
        // }
    // });
    
    // Handle incoming messages
    // socket.onmessage = function (e) {
    //     const data = JSON.parse(e.data);
    //     console.log(data);
    
    //     const messageDiv = document.createElement('div');
    //     messageDiv.classList.add('message', data.user === 'You' ? 'sent' : 'received');
    //     messageDiv.innerHTML = `<span class="user">${data.user}:</span> <span class="text">${data.message}</span>`;
        
    //     chatWindow.appendChild(messageDiv);
    //     chatWindow.scrollTop = chatWindow.scrollHeight;
    // };
    // socket.onerror = function(error) {
    //     console.error('WebSocket error:', error);
    // };
    
    // socket.onclose = function(event) {
    //     console.log('WebSocket connection closed:', event);
    // };
}
