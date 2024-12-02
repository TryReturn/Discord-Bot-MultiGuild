const { MessageEmbed } = require("discord.js");
const LogsChannel = require('../../database/models/ModLogModel');
const client = require('../../index.js');

async function getLogChannel(guildId) {
    try {
        const logsData = await LogsChannel.findOne({ guildId });
        return logsData ? logsData.channelId : null;
    } catch (error) {
        console.error('[ROLE UPDATE EVENT LOG] >> Error al obtener el canal de logs desde la base de datos:', error);
        return null;
    }
}

async function sendLog(embed, logChannel) {
    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`[ROLE UPDATE EVENT LOG] >> Error al enviar log al canal ${logChannel.id}:`, error);
    }
}

client.on('roleUpdate', async (oldRole, newRole) => {
    const guild = newRole.guild;
    const guildId = guild.id;
    const logChannelId = await getLogChannel(guildId);
    
    if (!logChannelId) return;

    const logChannel = client.channels.cache.get(logChannelId);
    if (!logChannel) return;

    let changes = [];
    if (oldRole.name !== newRole.name) {
        changes.push(`Nombre Cambiado: ${oldRole.name} ➔ ${newRole.name}`);
    }
    if (oldRole.color !== newRole.color) {
        changes.push(`Color: ${oldRole.hexColor} ➔ ${newRole.hexColor}`);
    }

    const addedPermissions = newRole.permissions.toArray().filter(p => !oldRole.permissions.has(p));
    const removedPermissions = oldRole.permissions.toArray().filter(p => !newRole.permissions.has(p));

    addedPermissions.forEach(permission => {
        if (permission === 'ADMINISTRATOR') {
            changes.push(`➔ Se añadió el permiso "**ADMINISTRATOR**"`);
        } else {
            changes.push(`➔ Se añadió el permiso "**${permission}**"`);
        }
    });

    removedPermissions.forEach(permission => {
        changes.push(`➔ Se eliminó el permiso "**${permission}**"`);
    });

    let editedBy = 'Desconocido';
    try {
        const auditLogs = await guild.fetchAuditLogs({ type: 'ROLE_UPDATE', limit: 1 });
        const roleUpdateLog = auditLogs.entries.first();
        if (roleUpdateLog) {
            editedBy = roleUpdateLog.executor;
        }
    } catch (error) {
        console.error('[ROLE UPDATE EVENT LOG] >> Error al obtener el registro de auditoría:', error);
    }

    const roleMentions = newRole.toString();

    if (changes.length > 0) {
        const roleEditEmbed = new MessageEmbed()
            .setColor('ORANGE')
            .setTitle('**ROLE EDIT** | Rol Editado')
            .setDescription(`**Rol**: ${roleMentions}\n**Editado por**: ${editedBy}\n**Cambios**:\n${changes.join('\n')}`)
            .setFooter({ text: guild.name, iconURL: guild.iconURL() })
            .setThumbnail(editedBy.avatarURL({ dynamic: true }))
            .setTimestamp();
    
        sendLog(roleEditEmbed, logChannel);
    }
});
