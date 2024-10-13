const fs = require('fs');
const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

// Устанавливаем EJS как движок для рендеринга
app.set('view engine', 'ejs');

// Указываем директорию для хранения шаблонов
app.set('views', path.join(__dirname, 'views'));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

const secretKey = 'your_secret_key'; // Ключ для подписи JWT

// Настройка для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
    }
});

const upload = multer({ storage: storage });

// Загружаем пользователей из JSON
let users = require('./users.json');

// Функция для сохранения данных в JSON файл
function saveUsersToFile() {
    fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));
}

// Получение IP-адреса пользователя
function getIpAddress(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

// Генерация JWT токена
function generateToken(user, ip) {
    const payload = { email: user.email, ip };
    return jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Токен действителен 1 час
}

// Проверка токена
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Требуется авторизация' });

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).json({ message: 'Недействительный токен' });

        // Дополнительная проверка IP (если необходимо)
        const currentIp = getIpAddress(req);
        if (user.ip && user.ip !== currentIp) {
            return res.status(403).json({ message: 'Вход с нового IP запрещён' });
        }

        req.user = user;
        next();
    });
}

// Маршрут для загрузки аватара
app.post('/uploadAvatar', upload.single('avatar'), (req, res) => {
    const { email } = req.body;
    let user = users.find(u => u.email === email);

    if (user && req.file) {
        // Проверяем, есть ли у пользователя старая аватарка, и она не является аватаркой по умолчанию
        if (user.avatar && user.avatar !== '/assets/images/icon-user.png') {
            // Удаляем старую аватарку
            const oldAvatarPath = path.join(__dirname, user.avatar);
            fs.unlink(oldAvatarPath, (err) => {
                if (err) {
                    console.log(`Ошибка при удалении файла: ${oldAvatarPath}`);
                } else {
                    console.log(`Старая аватарка удалена: ${oldAvatarPath}`);
                }
            });
        }

        // Обновляем путь к новой аватарке
        user.avatar = `/uploads/${req.file.filename}`;
        saveUsersToFile();  // Сохраняем изменения в файл

        res.json({ success: true, avatar: user.avatar });
    } else {
        res.json({ success: false, message: 'Ошибка при загрузке аватара' });
    }
});

app.use('/uploads', express.static('uploads')); // Открываем доступ к папке с загруженными файлами
app.use(express.static('public'));  // Делаем папку 'public' доступной для клиента

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Маршрут для регистрации
app.post('/register', (req, res) => {
    const { nickname, email, password } = req.body;

    // Проверка, существует ли уже пользователь с таким никнеймом или email
    if (users.find(user => user.nickname === nickname || user.email === email)) {
        return res.json({ success: false, message: 'Никнейм или email уже заняты' });
    }

    // Создание нового пользователя
    const newUser = { id: users.length + 1, nickname, email, password, avatar: '/assets/images/icon-user.png' };
    users.push(newUser);
    saveUsersToFile();

    const token = generateToken(newUser);
    res.json({ success: true, token });
});

// Маршрут для логина (без изменения, так как никнейм не требуется при входе)
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    const ip = getIpAddress(req);

    if (user) {
        const token = generateToken(user, ip); // Генерируем JWT с IP
        user.lastIp = ip; // Сохраняем последний IP
        saveUsersToFile();
        res.json({ success: true, token });
    } else {
        res.json({ success: false, message: 'Неверный email или пароль' });
    }
});



// Маршрут для профиля текущего пользователя (защищённый, по токену)
app.get('/profile', authenticateToken, (req, res) => {
    const user = users.find(u => u.email === req.user.email);
    if (user) {
        res.json({ success: true, user });
    } else {
        res.json({ success: false, message: 'Пользователь не найден' });
    }
});

// Новый маршрут для получения профиля пользователя по ID
app.get('/account/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);

    if (user) {
        // Рендерим HTML с данными пользователя
        res.render('account', {
            user: user
        });
    } else {
        res.status(404).send('Пользователь не найден');
    }
});


// Маршрут для обновления профиля (защищённый)
app.post('/updateProfile', authenticateToken, (req, res) => {
    const { nickname, email, oldPassword, newPassword } = req.body;
    const user = users.find(u => u.email === req.user.email);

    if (user) {
        // Проверяем старый пароль перед изменением
        if (newPassword && user.password !== oldPassword) {
            return res.json({ success: false, message: 'Старый пароль неверный' });
        }

        // Обновляем никнейм, почту и пароль, если они указаны
        if (nickname) user.nickname = nickname;
        if (email) user.email = email;
        if (newPassword) user.password = newPassword;

        saveUsersToFile();

        res.json({ success: true, user });
    } else {
        res.json({ success: false, message: 'Пользователь не найден' });
    }
});



// Запуск сервера
app.listen(3000, () => {
    console.log(`Сервер запущен на http://localhost:3000`);
});
