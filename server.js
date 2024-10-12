const express = require('express');
const app = express();
const port = 3000;

// Временное хранилище пользователей
const users = [];

app.use(express.json());
app.use(express.static('public'));  // Делаем папку 'public' доступной для клиента

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});
app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/public/about.html');
});
app.get('/switch', (req, res) => {
    res.sendFile(__dirname + '/public/switch.html');
});
app.get('/storie1', (req, res) => {
    res.sendFile(__dirname + '/public/stories/storie1.html');
});
app.get('/storie2', (req, res) => {
    res.sendFile(__dirname + '/public/stories/storie1.html');
});

// Маршрут для входа
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Неверный email или пароль' });
    }
});

// Маршрут для регистрации
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (user) {
        res.json({ success: false, message: 'Пользователь уже существует' });
    } else {
        users.push({ email, password });
        res.json({ success: true });
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
