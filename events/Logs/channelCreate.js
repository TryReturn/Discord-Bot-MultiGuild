const { MessageEmbed } = require("discord.js");
const LogsChannel = require('../../database/models/ModLogModel');
const client = require('../../index.js');

async function getLogChannel(guildId) {
    try {
        const logsData = await LogsChannel.findOne({ guildId });
        return logsData ? logsData.channelId : null;
    } catch (error) {
        console.error('[CHANNEL CREATE EVENT LOG] >> Error al obtener el canal de logs desde la base de datos:', error);
        return null;
    }
}

async function sendLog(logChannel, embed) {
    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`[CHANNEL CREATE EVENT LOG] >> Error al enviar log al canal ${logChannel.id}:`, error);
    }
}

client.on('channelCreate', async (channel) => {
    const guildId = channel.guild.id;
    const logChannelId = await getLogChannel(guildId);
    if (!logChannelId) return;

    const logsChannel = client.channels.cache.get(logChannelId);
    if (!logsChannel || !logsChannel.isText()) return;

    let createdBy = 'Desconocido';
    try {
        const meMember = channel.guild.members.cache.get(client.user.id);
        if (meMember.permissions.has('VIEW_AUDIT_LOG')) {
            const auditLogs = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_CREATE', limit: 1 });
            const channelCreateLog = auditLogs.entries.first();
            if (channelCreateLog) {
                createdBy = channelCreateLog.executor;
            }
        }
    } catch (error) {
        console.error('[CHANNEL CREATE EVENT LOG] >> Error al obtener el registro de auditoría:', error);
    }

    const channelCreateEmbed = new MessageEmbed()
        .setColor('#00FF00')
        .setTitle('**CHANNEL CREATE** | Canal Creado')
        .setDescription(`**Canal:** ${channel.toString()}\n**Tipo:** ${channel.type}\n**Creado por:** ${createdBy}`)
        .setFooter({ text: channel.guild.name, iconURL: channel.guild.iconURL() })
        .setThumbnail(channel.guild.members.cache.get(createdBy.id).user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    await sendLog(logsChannel, channelCreateEmbed);
});
