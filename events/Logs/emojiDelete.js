const { MessageEmbed } = require("discord.js");
const LogsChannel = require('../../database/models/ModLogModel');
const client = require('../../index.js');

async function getLogChannel(guildId) {
    try {
        const logsData = await LogsChannel.findOne({ guildId });
        return logsData ? logsData.channelId : null;
    } catch (error) {
        console.error('[EMOJI DELETE EVENT LOG] >> Error al obtener el canal de logs desde la base de datos:', error);
        return null;
    }
}

async function sendLog(logChannel, embed) {
    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`[EMOJI DELETE EVENT LOG] >> Error al enviar log al canal ${logChannel.id}:`, error);
    }
}

client.on('emojiDelete', async (emoji) => {
    const guildId = emoji.guild.id;
    const logChannelId = await getLogChannel(guildId);
    if (!logChannelId) return;

    const logsChannel = client.channels.cache.get(logChannelId);
    if (!logsChannel || !logsChannel.isText()) return;

    try {
        const auditLogs = await emoji.guild.fetchAuditLogs({ type: 'EMOJI_DELETE', limit: 1 });
        const emojiDeleteLog = auditLogs.entries.find(entry =>
            entry.target.id === emoji.id && entry.action === 'EMOJI_DELETE'
        );

        const deletedBy = emojiDeleteLog ? emojiDeleteLog.executor : 'Desconocido';

        const emojiDeleteEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('**EMOJI DELETE** | Emoji Eliminado')
            .setDescription(`**Nombre:** ${emoji.name}\n**Eliminado por:** ${deletedBy}`)
            .setFooter({ text: emoji.guild.name, iconURL: emoji.guild.iconURL() })
            .setTimestamp();

        if (deletedBy !== 'Desconocido') {
            emojiDeleteEmbed.setThumbnail(deletedBy.avatarURL({ dynamic: true }));
        }

        await sendLog(logsChannel, emojiDeleteEmbed);
    } catch (error) {
        console.error('[EMOJI DELETE EVENT LOG] >> Error al registrar la eliminación de emoji:', error);
    }
});
