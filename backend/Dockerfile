FROM mcr.microsoft.com/playwright:v1.40.0-jammy-amd64

# Node.js is already included in this image
# Chromium and all dependencies are pre-installed

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]
