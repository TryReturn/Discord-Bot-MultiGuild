const { MessageEmbed } = require("discord.js");
const LogsChannel = require('..//..//database/models/ModLogModel');
const client = require('../../index.js');

async function getLogChannel(guildId) {
    try {
        const logsData = await LogsChannel.findOne({ guildId });
        return logsData ? logsData.channelId : null;
    } catch (error) {
        console.error('Error al obtener el canal de logs desde la base de datos:', error);
        return null;
    }
}

async function sendLog(guildId, embed) {
    const logChannelId = await getLogChannel(guildId);
    if (!logChannelId) return;

    const logChannel = client.channels.cache.get(logChannelId);
    if (!logChannel) return;

    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`Error al enviar log al canal ${logChannelId}:`, error);
    }
}

client.on('roleDelete', async (role) => {
    const guild = role.guild;

    const auditLogs = await guild.fetchAuditLogs({ type: 'ROLE_DELETE', limit: 1 });
    const auditEntry = auditLogs.entries.first();

    let deletedBy = 'Desconocido';
    let avatarURL = null;

    if (auditEntry) {
        deletedBy = auditEntry.executor.tag;
        avatarURL = auditEntry.executor.avatarURL({ dynamic: true });
    }

    const roleDeleteEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('**ROLE DELETE** | Rol Eliminado')
        .setDescription(`**Rol**: ${role.name}\n**Eliminado por**: ${deletedBy}`)
        .setFooter({ text: guild.name, iconURL: guild.iconURL() })
        .setThumbnail(avatarURL)
        .setTimestamp();

    sendLog(guild.id, roleDeleteEmbed);
});
