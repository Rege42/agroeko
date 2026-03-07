# Установка проекта
### Должно быть установлено:
- Node.js
- Docker

Откройте терминал в корневой папке и перейдите в backend/src:

```bash
cd backend/src
```

Установите зависимости:

```bash
npm install express mongoose dotenv
```
```bash
npm install -D nodemon
```

### Настройка переменных окружения

Создайте файл .env в папке src

Пример содержимого:

```
PORT=3000
MONGO_URI=mongodb://admin:password123@127.0.0.1:27017/agropole_rotation?authSource=admin
```
### Запуск MongoDB

Запустите MongoDB и mongo-express выполнив следюущую команду

Пример содержимого:

```bash
docker-compose up
```

# Запуск проекта

Производится в backend/src:

```bash
npm run start
```

Запуск в режиме разработчика:
```bash
npm run dev
```

