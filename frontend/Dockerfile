FROM node:20-slim

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

RUN npm install

COPY . .

# Экспонируем порт Vite
EXPOSE 5173

# Запуск dev сервера на 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
