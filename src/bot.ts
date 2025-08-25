import axios from 'axios';
import bunyan, { LogLevel, LogLevelString } from 'bunyan';
import crypto from 'crypto';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, EmbedBuilder, Events, GatewayIntentBits, Partials, TextChannel } from 'discord.js';
import "dotenv/config";

const log = bunyan.createLogger({
    name: 'wallet-verification-discord-bot',
});

const {
    DISCORD_TOKEN,
    BACKEND_BASE_URL,
    FRONTEND_URL,
    BACKEND_BASIC_AUTH_ENABLED,
    BACKEND_BASIC_AUTH_PASSWORD,
    BACKEND_BASIC_AUTH_USER,
    VERIFIED_ROLE_ID,
    CHANNEL_ID,
    GUILD_ID,
    DISCORD_VERIFICATION_BOT_SALT,
    BOT_MESSAGE_WELCOME,
    BOT_MESSAGE_SUCCESS,
    BOT_MESSAGE_ALREADY_VERIFIED,
    BOT_MESSAGE_RULES_NOT_ACCEPTED,
    BOT_BUTTON_LABEL,
    BOT_SUCCESS_BUTTON_LABEL,
    BOT_ERROR_MESSAGE,
    LOG_LEVEL = "info"
} = process.env;

log.level(LOG_LEVEL as LogLevelString);

const authenticationHeader = {};

if (BACKEND_BASIC_AUTH_ENABLED) {
    const token = Buffer.from(
        `${BACKEND_BASIC_AUTH_USER}:${BACKEND_BASIC_AUTH_PASSWORD}`,
        'utf8'
    ).toString('base64');
    authenticationHeader['headers'] = {
        'x-cf-login-system': 'BASIC',
        Authorization: `Basic ${token}`,
    };
}

const client = new Client({
    partials: [Partials.Channel],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
    ],
});

const generateAuthenticationSecret = () => {
    const randomSecret = (Math.random() + 1)
        .toString(36)
        .replace('1.', '');

    return randomSecret;
};

client.login(DISCORD_TOKEN);

client.once(Events.ClientReady, async (client) => {
    log.info(`Logged in as ${client.user.tag}!`);

    const channel: TextChannel = client.channels.cache.get(CHANNEL_ID) as TextChannel;

    if (channel.isTextBased) {
        const messages = await channel.messages.fetch();
        const hasBotPostedInChannel = messages.some(message => message.author.id === client.user.id);
        if (!hasBotPostedInChannel) {
            const button = new ButtonBuilder()
                .setLabel(BOT_BUTTON_LABEL || 'Start Wallet Verification')
                .setCustomId('start_wallet_verification')
                .setStyle(ButtonStyle.Success);

            const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

            channel.send({
                content: BOT_MESSAGE_WELCOME || 'Click the button below to verify your wallet',
                components: [actionRow],
            })
        } else {
            log.debug('Button is already posted in this channel.');
        }
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    log.debug("Start verification.")
    if (interaction.user.bot) return;

    if (interaction.isButton) {
        const errorReply = BOT_ERROR_MESSAGE || `Hi ${interaction.user.username}, something went wrong. Please try again later.`;
        log.debug("Start interaction.")

        interaction = (interaction as ButtonInteraction);
        try {
            const discordUserId = interaction.user.id;
            log.debug("Fetch guilds from guild id.")
            const guild = await client.guilds.fetch(GUILD_ID);

            try {
                log.debug("Fetch guild members.")
                const guildMember = await guild.members.fetch({
                    user: discordUserId,
                    force: true,
                });

                if (!guildMember.roles.cache.hasAny(VERIFIED_ROLE_ID)) {
                    log.debug("User %s is not yet verified.", interaction.user.username);
                    const reply = BOT_MESSAGE_RULES_NOT_ACCEPTED || `Hi ${interaction.user.username}, you need to accept our terms and conditions by reacting with a 🚀 emoji to the message within the verification channel. Click the button again once you have accepted the terms and conditions.`;

                    interaction.reply({
                        content: reply.replaceAll('${USERNAME}', interaction.user.username),
                        ephemeral: true,
                    });
                    return;
                }
            } catch (error) {
                log.error((error as Error).message);
                interaction.reply({
                    content: errorReply.replaceAll('${USERNAME}', interaction.user.username),
                    ephemeral: true
                });
                return;
            }

            const hashedDiscordId = crypto
                .createHash('sha256')
                .update(DISCORD_VERIFICATION_BOT_SALT + discordUserId)
                .digest('hex');

            const response = await axios.get(`${BACKEND_BASE_URL}/is-verified/${hashedDiscordId}`, authenticationHeader);

            if (response.data.verified) {
                log.debug("User %s has already verified a verified wallet.", interaction.user.username);
                const reply = BOT_MESSAGE_ALREADY_VERIFIED || `Hi ${interaction.user.username}, you have already verified your wallet!`;

                interaction.reply({
                    content: reply.replaceAll('${USERNAME}', interaction.user.username),
                    ephemeral: true
                });
                return;
            }

            const randomSecret = generateAuthenticationSecret();
            try {
                log.debug("Start verification.");
                const startVerificationResponse = await axios.post(`${BACKEND_BASE_URL}/start-verification`, {
                    discordIdHash: hashedDiscordId,
                    secret: randomSecret,
                }, authenticationHeader);

                if (startVerificationResponse.status !== 200) {
                    log.error("Failed to start verification with wallet-verification backend. %s", startVerificationResponse.data);
                    interaction.reply({
                        content: errorReply.replaceAll('${USERNAME}', interaction.user.username),
                        ephemeral: true
                    });
                    return;
                }

                const button = new ButtonBuilder()
                    .setLabel(BOT_SUCCESS_BUTTON_LABEL || 'Finish Wallet Verification')
                    .setURL(`${FRONTEND_URL}?action=verification&secret=${hashedDiscordId}|${randomSecret}`)
                    .setStyle(ButtonStyle.Link);

                const reply = BOT_MESSAGE_SUCCESS || `Thank you ${interaction.user}, a new secret was generated for you. Please copy and paste this secret into Cardano Ballot and sign it.`;
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setDescription(`\`${hashedDiscordId}|${randomSecret}\``);

                await interaction.reply({
                    content: reply.replaceAll('${USERNAME}', interaction.user.username),
                    ephemeral: true,
                    embeds: [embed],
                });
            } catch (error) {
                log.error((error as Error).message);
                interaction.reply({
                    content: errorReply.replaceAll('${USERNAME}', interaction.user.username),
                    ephemeral: true
                });
            }
        } catch (error) {
            log.error(error);
        }
    }
});
