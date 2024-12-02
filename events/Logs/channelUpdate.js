const { MessageEmbed } = require("discord.js");
const LogsChannel = require('../../database/models/ModLogModel');
const client = require('../../index.js');

async function getLogChannel(guildId) {
    try {
        const logsData = await LogsChannel.findOne({ guildId });
        return logsData ? logsData.channelId : null;
    } catch (error) {
        console.error('[CHANNEL UPDATE EVENT LOG] >> Error al obtener el canal de logs desde la base de datos:', error);
        return null;
    }
}

async function sendLog(logChannel, embed) {
    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`[CHANNEL UPDATE EVENT LOG] >> Error al enviar log al canal ${logChannel.id}:`, error);
    }
}

client.on('channelUpdate', async (oldChannel, newChannel) => {
    const guildId = newChannel.guild.id;
    const logChannelId = await getLogChannel(guildId);
    if (!logChannelId) return;

    const logsChannel = client.channels.cache.get(logChannelId);
    if (!logsChannel || !logsChannel.isText()) return;

    let editedBy = 'Desconocido';
    let changes = [];

    try {
        const auditLogs = await newChannel.guild.fetchAuditLogs({ type: 'CHANNEL_UPDATE', limit: 1 });
        const channelUpdateLog = auditLogs.entries.find(entry => 
            entry.target.id === newChannel.id && entry.action === 'CHANNEL_UPDATE'
        );

        if (channelUpdateLog) {
            editedBy = channelUpdateLog.executor;
            if (oldChannel.name !== newChannel.name) {
                changes.push(`**➪** Cambio de nombre: \`${oldChannel.name}\` → \`${newChannel.name}\``);
            }
            if (oldChannel.topic !== newChannel.topic) {
                changes.push(`**➪** Cambio de descripción: \`${oldChannel.topic || 'Ninguna'}\` → \`${newChannel.topic || 'Ninguna'}\``);
            }
            if (oldChannel.type !== newChannel.type) {
                changes.push(`**➪** Cambio de tipo: \`${oldChannel.type}\` → \`${newChannel.type}\``);
            }
        }
    } catch (error) {
        console.error('[CHANNEL UPDATE EVENT LOG] >> Error al obtener el registro de auditoría:', error);
    }

    if (changes.length > 0) {
        const channelUpdateEmbed = new MessageEmbed()
            .setColor('#FFA500')
            .setTitle('**CHANNEL UPDATE** | Canal Actualizado')
            .setDescription(`**Canal:** <#${newChannel.id}>\n**Editado por:** ${editedBy}\n${changes.join('\n')}`)
            .setThumbnail(newChannel.guild.members.cache.get(editedBy.id).user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: newChannel.guild.name, iconURL: newChannel.guild.iconURL() })
            .setTimestamp();

        await sendLog(logsChannel, channelUpdateEmbed);
    }
});
