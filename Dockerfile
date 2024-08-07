FROM node:18-alpine
ENV NODE_ENV production

WORKDIR /opt/bot

COPY package*.json ./
RUN npm ci --only=production && \
    npm install -g typescript
COPY . .
RUN npm run build

CMD [ "node", "dist/bot.js" ]
