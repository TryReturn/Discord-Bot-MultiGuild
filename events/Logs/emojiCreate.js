const { MessageEmbed } = require("discord.js");
const LogsChannel = require('../../database/models/ModLogModel');
const client = require('../../index.js');

async function getLogChannel(guildId) {
    try {
        const logsData = await LogsChannel.findOne({ guildId });
        return logsData ? logsData.channelId : null;
    } catch (error) {
        console.error('[EMOJI CREATE EVENT LOG] >> Error al obtener el canal de logs desde la base de datos:', error);
        return null;
    }
}

async function sendLog(logChannel, embed) {
    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`[EMOJI CREATE EVENT LOG] >> Error al enviar log al canal ${logChannel.id}:`, error);
    }
}

client.on('emojiCreate', async (emoji) => {
    const guildId = emoji.guild.id;
    const logChannelId = await getLogChannel(guildId);
    if (!logChannelId) return;

    const logsChannel = client.channels.cache.get(logChannelId);
    if (!logsChannel || !logsChannel.isText()) return;

    try {
        const auditLogs = await emoji.guild.fetchAuditLogs({ type: 'EMOJI_CREATE', limit: 1 });
        const emojiCreateLog = auditLogs.entries.find(entry =>
            entry.target.id === emoji.id && entry.action === 'EMOJI_CREATE'
        );

        const addedBy = emojiCreateLog ? emojiCreateLog.executor : 'Desconocido';

        const emojiNameWithEmoji = `${emoji} ${emoji.name}`;
        const emojiUrl = `[Click para Ver](${emoji.url})`;

        const emojiCreateEmbed = new MessageEmbed()
            .setColor('#00ff00')
            .setTitle('**EMOJI CREATE** | Emoji Creado')
            .setDescription(`**Nombre:** ${emojiNameWithEmoji}\n**URL:** ${emojiUrl}\n**Añadido por:** ${addedBy}`)
            .setThumbnail(emoji.url)
            .setFooter({ text: emoji.guild.name, iconURL: emoji.guild.iconURL() })
            .setTimestamp();

        await sendLog(logsChannel, emojiCreateEmbed);
    } catch (error) {
        console.error('[EMOJI CREATE EVENT LOG] >> Error al registrar la creación de emoji:', error);
    }
});
