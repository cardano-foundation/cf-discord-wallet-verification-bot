FROM node:16-alpine
ENV NODE_ENV production

ARG DISCORD_VERIFICATION_BOT_SALT
ARG DISCORD_TOKEN
ARG BACKEND_BASE_URL
ARG BACKEND_BASIC_AUTH_PASSWORD
ARG BACKEND_BASIC_AUTH_USER
ARG FRONTEND_URL
ARG VERIFIED_ROLE_ID
ARG GUILD_ID
ARG CHANNEL_ID

WORKDIR /opt/bot

COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

CMD [ "node", "dist/bot.js" ]