const { MessageEmbed } = require("discord.js");
const LogsChannel = require('..//..//database/models/ModLogModel');
const client = require('../../index.js');

async function getLogChannel(guildId) {
    try {
        const logsData = await LogsChannel.findOne({ guildId });
        return logsData ? logsData.channelId : null;
    } catch (error) {
        console.error('[ROLE CREATE EVENT] >> Error al obtener el canal de logs desde la base de datos:', error);
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
        console.error(`[ROLE CREATE EVENT] >> Error al enviar log al canal ${logChannelId}:`, error);
    }
}

client.on('roleCreate', async (role) => {
    const guild = role.guild;

    const auditLogs = await guild.fetchAuditLogs({ type: 'ROLE_CREATE', limit: 1 });
    const auditEntry = auditLogs.entries.first();

    let createdBy = 'Desconocido';
    let avatarURL = guild.iconURL({ dynamic: true });

    if (auditEntry && auditEntry.executor) {
        createdBy = auditEntry.executor;
        avatarURL = createdBy.avatarURL({ dynamic: true });
    }

    const roleCreateEmbed = new MessageEmbed()
        .setColor('ORANGE')
        .setTitle('**ROLE CREATE** | Rol Creado')
        .setDescription(`**Rol**: ${role.name} (<@&${role.id}>)\n**Rol ID**: ${role.id}\n**Creado por**: ${createdBy}`)
        .setFooter({ text: guild.name, iconURL: guild.iconURL() })
        .setThumbnail(avatarURL)
        .setTimestamp();

    sendLog(guild.id, roleCreateEmbed);
});
