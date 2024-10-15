const chat = document.getElementById('chat');
const input = document.getElementById('input');
let index = 0;
let userTurn = false;

function displayMessage() {
    if (index < messages.length) {
        if (messages[index].sender === 'sender') {
            const typingIndicator = document.createElement('div');
            typingIndicator.classList.add('typing');
            typingIndicator.innerHTML = `${messages[index].name} печатает<span></span><span></span><span></span>`;
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

    // Определяем класс для сообщения в зависимости от отправителя
    if (messages[index].type === 'author') {
        message.classList.add('author');
    } else {
        message.classList.add('message', messages[index].sender);
    }

    // Если тип не author и не user, добавляем имя отправителя перед текстом сообщения
    if (messages[index].type !== 'author' && messages[index].type !== 'user') {
        const nameElement = document.createElement('div');
        nameElement.classList.add('name');
        nameElement.textContent = messages[index].name + ":";
        message.appendChild(nameElement);
    }

    // Добавляем сам текст сообщения
    const textElement = document.createElement('div');
    textElement.textContent = messages[index].text;
    message.appendChild(textElement);

    // Добавляем время сообщения
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

        // Добавляем текст сообщения
        const textElement = document.createElement('div');
        textElement.textContent = messages[index].text;
        userMessage.appendChild(textElement);

        // Добавляем время сообщения
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
        addMessageOnClick();
    }
});

displayMessage();
