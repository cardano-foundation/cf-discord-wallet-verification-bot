# 🤖 Discord Verification Bot 🤝

This bot aims to provide a wallet and user association based on the user's discord account.

## 🦾 Getting Started

1. Add an empty .env file beside this README.md file
2. [Create a discord app](https://discord.com/developers/docs/getting-started)
3. Click on the menu entry `Bot` (under Settings) and press "View Token" to get a token and copy it into the .env file as `DISCORD_TOKEN=<token>`
4. Enable "MESSAGE CONTENT INTENT" under `Previliged Gateway Intents` at the bottom of this page
5. Goto the `OAuth2 > URL Generator` and activate the "bot" scope
6. Within the bot perimssion section (below) check `Read Messages/View Channels`, `Send Messages`, `Embed Links`, `Read Message History` and `Use Embedded Activities`
7. Copy the generated URL and open it in a new tab
8. Select the server you want to add the bot to and press "Authorize"
9. `OPTIONAL` Change the verification level to "Highest" in the server settings under "Safety Setup" to make sure a user can only link accounts to wallets that have a verified phone number on Discord `It prevents users from creating multiple accounts and linking them to different wallets`
10. In the Discord user settings under "Advanced" enable "Developer Mode" (this is needed to get the server and channel id)
11. Right click on the server and copy the server id and add it to the .env file as `GUILD_ID=<server id>`
12. Create a new channel e.g. "🔗wallet-verification" which is only visible for verified users and ❗ make sure only the bot can send messages in this channel by changing the channel permissions ❗
13. Right click on the channel and copy the channel id and add it to the .env file as `CHANNEL_ID=<channel id>`
14. If you don't have it yet, create a new role e.g. "Verified" that a user gets after accepting the rules of your server
15. Right click on the role and copy the role id and add it to the .env file as `VERIFIED_ROLE_ID=<role id>`
16. The bot will send a message to a backend you would need to provide. Please make sure to implement the endpoints as described below in the "Endpoints" section
17. Provide the backend within the .env file as `BACKEND_BASE_URL=<backend url>`
18. Run `npm install` to install all dependencies
19. Run `npm run build` to transpile the typescript code
20. Run `npm run start` to start the bot

### 👀 Endpoints

- `GET` `{{ BACKEND_BASE_URL }}`/is-verified/<hashedDiscordId> - Checks if a user is verified and return `verified: true` or `verified: false`
- `POST` `{{ BACKEND_BASE_URL }}`/start-verification - Starts the verification process and returns 200 if successful
This endpoint expects a body like this, which needs to be stored for instance in a database:
```json
{
    "discordIdHash": "<hashedDiscordId>",
    "secret": "<randomSecret>",
}
```
- `POST` `{{ BACKEND_BASE_URL }}`/check-verification - This endpoint is called by the frontend to send signature along with the secret and hashed Discord id to the backend. The backend needs to check if the signature is valid and if the hashed Discord id and secret matches the one stored in the database.

## 🌱 Environment Variables

### Required Variables

| Variable | Description |
| --- | --- |
| DISCORD_TOKEN | The token of the discord bot |
| GUILD_ID | The id of the discord server |
| CHANNEL_ID | The id of the discord channel |
| VERIFIED_ROLE_ID | The id of the verified role |
| BACKEND_BASE_URL | The base url of the backend |
| FRONTEND_URL | The url of the frontend. The bot will link the user to this url with secret and hashed Discord id as url parameters |

### Optional Variables

| Variable | Description | Default |
| --- | --- | --- |
| DISCORD_VERIFICATION_BOT_SALT | It's an extra prefix added to the discord id before hashing to increase the security |
| BACKEND_BASIC_AUTH_ENABLED | Enables or disables basic auth | false |
| BACKEND_BASIC_AUTH_USER | The username of the basic auth | |
| BACKEND_BASIC_AUTH_PASSWORD | The password of the basic auth | |
| BOT_MESSAGE_WELCOME | A message the bot sends alongside the verification button | Click the button below to verify your wallet |
| BOT_BUTTON_LABEL | The label of the verification button | Start Wallet Verification |
| BOT_MESSAGE_RULES_NOT_ACCEPTED | The message the bot sends in case the user does not have the `verified` role | Hi ${USERNAME}, you need to accept our terms and conditions by reacting with a 🚀 emoji to the message within the verification channel. Click the button again once you have accepted the terms and conditions. |
| BOT_MESSAGE_SUCCESS | A message the bot sends together with the frontend link to finish the verification process on your website | Thank you $${USERNAME}, please follow this link to finish the verification process on our website!` |
| BOT_SUCCESS_BUTTON_LABEL | The label of the button the bot sends to finish the verification process in the frontend | Finish Wallet Verification |
| BOT_MESSAGE_ALREADY_VERIFIED | A message the bot sends in case the user is already verified | Hi ${USERNAME}, you have already verified your wallet! |
| BOT_ERROR_MESSAGE | A message the bot sends in case of an error | Hi ${USERNAME}, something went wrong. Please try again later! |

## 🏗 Development

We use a mix of tsc -w and nodemon to watch for changes and restart the bot. Just run the following command to start the bot in development mode:

```zsh
npm run dev
```