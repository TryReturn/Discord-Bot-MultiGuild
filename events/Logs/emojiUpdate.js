const { MessageEmbed } = require("discord.js");
const LogsChannel = require('../../database/models/ModLogModel');
const client = require('../../index.js');

async function getLogChannel(guildId) {
    try {
        const logsData = await LogsChannel.findOne({ guildId });
        return logsData ? logsData.channelId : null;
    } catch (error) {
        console.error('[EMOJI UPDATE EVENT LOG] >> Error al obtener el canal de logs desde la base de datos:', error);
        return null;
    }
}

async function sendLog(logChannel, embed) {
    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`[EMOJI UPDATE EVENT LOG] >> Error al enviar log al canal ${logChannel.id}:`, error);
    }
}

client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
    const guildId = newEmoji.guild.id;
    const logChannelId = await getLogChannel(guildId);
    if (!logChannelId) return;

    const logsChannel = client.channels.cache.get(logChannelId);
    if (!logsChannel || !logsChannel.isText()) return;

    try {
        const auditLogs = await newEmoji.guild.fetchAuditLogs({ type: 'EMOJI_UPDATE', limit: 1 });
        const emojiUpdateLog = auditLogs.entries.find(entry =>
            entry.target.id === newEmoji.id && entry.action === 'EMOJI_UPDATE'
        );

        const updatedBy = emojiUpdateLog ? emojiUpdateLog.executor : 'Desconocido';
        const oldEmojiName = oldEmoji.name;

        const emojiUpdateEmbed = new MessageEmbed()
            .setColor('#ffff00')
            .setTitle('**EMOJI UPDATE** | Emoji Actualizado')
            .setDescription(`**Nombre Anterior:** ${oldEmojiName}\n**Nombre Nuevo:** ${newEmoji.name}\n**Actualizado por:** ${updatedBy}`)
            .setFooter({ text: newEmoji.guild.name, iconURL: newEmoji.guild.iconURL() })
            .setTimestamp();

        if (emojiUpdateLog && emojiUpdateLog.executor) {
            emojiUpdateEmbed.setThumbnail(emojiUpdateLog.executor.avatarURL({ dynamic: true }));
        }

        await sendLog(logsChannel, emojiUpdateEmbed);
    } catch (error) {
        console.error('[EMOJI UPDATE EVENT LOG] >> Error al registrar la actualización de emoji:', error);
    }
});
