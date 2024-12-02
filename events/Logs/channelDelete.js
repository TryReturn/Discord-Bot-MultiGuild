const { MessageEmbed } = require("discord.js");
const LogsChannel = require('../../database/models/ModLogModel');
const client = require('../../index.js');

async function getLogChannel(guildId) {
    try {
        const logsData = await LogsChannel.findOne({ guildId });
        return logsData ? logsData.channelId : null;
    } catch (error) {
        console.error('[CHANNEL DELETE EVENT LOG] >> Error al obtener el canal de logs desde la base de datos:', error);
        return null;
    }
}

async function sendLog(logChannel, embed) {
    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`[CHANNEL DELETE EVENT LOG] >> Error al enviar log al canal ${logChannel.id}:`, error);
    }
}

client.on('channelDelete', async (channel) => {
    const guildId = channel.guild.id;
    const logChannelId = await getLogChannel(guildId);
    if (!logChannelId) return;

    const logsChannel = client.channels.cache.get(logChannelId);
    if (!logsChannel || !logsChannel.isText()) return;

    let deletedBy = 'Desconocido';
    try {
        const auditLogs = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_DELETE', limit: 1 });
        const channelDeleteLog = auditLogs.entries.find(entry =>
            entry.target.id === channel.id && entry.action === 'CHANNEL_DELETE'
        );
        if (channelDeleteLog) {
            deletedBy = channelDeleteLog.executor;
        }
    } catch (error) {
        console.error('[CHANNEL DELETE EVENT LOG] >> Error al obtener el registro de auditoría:', error);
    }

    const channelDeleteEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('**CHANNEL DELETED** | Canal Eliminado')
        .setDescription(`**Canal:** \`${channel.name}\`\n**Tipo:** ${channel.type}\n**Eliminado por:** ${deletedBy}`)
        .setFooter({ text: channel.guild.name, iconURL: channel.guild.iconURL() })
        .setTimestamp()
        .setThumbnail(channel.guild.members.cache.get(deletedBy.id).user.displayAvatarURL({ dynamic: true }));

    await sendLog(logsChannel, channelDeleteEmbed);
});
