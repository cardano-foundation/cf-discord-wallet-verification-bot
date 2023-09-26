FROM node:16-alpine
ENV NODE_ENV production

WORKDIR /opt/bot

COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

CMD [ "node", "dist/bot.js" ]
