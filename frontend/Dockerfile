FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_BACKEND_URL=http://localhost:3001

EXPOSE 3000

CMD ["npm", "run", "dev"]
