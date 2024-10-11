const chat = document.getElementById('chat');
const input = document.getElementById('input');
let index = 0;
let userTurn = false;
// const helpButton = document.querySelector('.help-button');
// const tooltip = document.querySelector('.tooltip');
//
// helpButton.addEventListener('mouseover', () => {
//     tooltip.style.display = 'block';
// });
//
// helpButton.addEventListener('mouseout', () => {
//     tooltip.style.display = 'none';
// });
function displayMessage() {
    if (index < messages.length) {
        if (messages[index].sender === 'max') {
            const typingIndicator = document.createElement('div');
            typingIndicator.classList.add('typing');
            typingIndicator.innerHTML = 'Макс печатает<span></span><span></span><span></span>';
            chat.appendChild(typingIndicator);
            chat.scrollTop = chat.scrollHeight;

            setTimeout(() => {
                chat.removeChild(typingIndicator);
                addMessage();
            }, 2000);
        } else {
            addMessage();
        }
    }
}

function addMessage() {
    const message = document.createElement('div');
    if (messages[index].type === 'author') {
        message.classList.add('author');
    } else {
        message.classList.add('message', messages[index].sender);
    }
    message.textContent = messages[index].text;

    // Добавляем время для сообщений от max и user
    if (messages[index].time) {
        const timeElement = document.createElement('div');
        timeElement.classList.add('time');
        timeElement.textContent = messages[index].time;
        message.appendChild(timeElement);
    }

    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
    index++;

    if (index < messages.length && messages[index].sender === 'user') {
        userTurn = true;
    } else {
        userTurn = false;
        if (index < messages.length) {
            setTimeout(displayMessage, 3000);
        }
    }
}
function addMessageOnClick() {
    if (userTurn === true) {
        const userMessage = document.createElement('div');
        userMessage.classList.add('message', 'user');
        userMessage.textContent = messages[index].text;

        // Добавляем время для сообщения пользователя
        const timeElement = document.createElement('div');
        timeElement.classList.add('time');
        timeElement.textContent = messages[index].time;
        userMessage.appendChild(timeElement);

        chat.appendChild(userMessage);
        chat.scrollTop = chat.scrollHeight;
        input.value = '';
        userTurn = false;
        index++;
        setTimeout(displayMessage, 3000);
    }
}

input.addEventListener('keypress', function (event) {
    if (event.key === 'Enter' && userTurn) {
        addMessageOnClick()
    }
});

displayMessage();
    