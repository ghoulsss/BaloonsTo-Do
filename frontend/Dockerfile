FROM node:20-slim

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

RUN npm ci --no-audit --no-fund --fetch-timeout=30000 --fetch-retries=2

COPY . .

# Экспонируем порт Vite
EXPOSE 5173

# Запуск dev сервера на 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
