const { MessageEmbed } = require("discord.js");
const LogsChannel = require('../../database/models/ModLogModel');
const client = require('../../index.js');

async function getLogChannel(guildId) {
    try {
        const logsData = await LogsChannel.findOne({ guildId });
        return logsData ? logsData.channelId : null;
    } catch (error) {
        console.error('[GUILD MEMBER ROLE EVENT LOG] >> Error al obtener el canal de logs desde la base de datos:', error);
        return null;
    }
}

async function sendLog(logChannel, embed) {
    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`[GUILD MEMBER ROLE EVENT LOG] >> Error al enviar log al canal ${logChannel.id}:`, error);
    }
}

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const guildId = newMember.guild.id;
    const logChannelId = await getLogChannel(guildId);
    if (!logChannelId) return;

    const logChannel = client.channels.cache.get(logChannelId);
    if (!logChannel) return;

    try {
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));

        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        if (addedRoles.size === 0 && removedRoles.size === 0) return;

        const auditLogs = await newMember.guild.fetchAuditLogs({ type: 'MEMBER_ROLE_UPDATE', limit: 1 });
        const roleUpdateLog = auditLogs.entries.first();

        if (roleUpdateLog && roleUpdateLog.executor.id !== client.user.id) {
            const executor = roleUpdateLog.executor;

            const newMemberMention = newMember.toString();
            const executorMention = executor.toString();

            for (const [roleId, role] of addedRoles) {
                const memberAddRoleEmbed = new MessageEmbed()
                    .setColor('#00FF00')
                    .setTitle('**GUILD MEMBER ADD ROLE** | Rol Añadido a Miembro')
                    .setDescription(`**Usuario**: ${newMemberMention}\n**Rol**: <@&${roleId}>\n**Añadido por**: ${executorMention}`)
                    .setFooter({ text: newMember.guild.name, iconURL: newMember.guild.iconURL() })
                    .setThumbnail(newMember.guild.members.cache.get(executor.id).user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                await sendLog(logChannel, memberAddRoleEmbed);
            }

            for (const [roleId, role] of removedRoles) {
                const memberRemoveRoleEmbed = new MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle('**GUILD MEMBER REMOVE ROLE** | Rol Eliminado de Miembro')
                    .setDescription(`**Usuario**: ${newMemberMention}\n**Rol**: <@&${roleId}>\n**Eliminado por**: ${executorMention}`)
                    .setFooter({ text: newMember.guild.name, iconURL: newMember.guild.iconURL() })
                    .setThumbnail(newMember.guild.members.cache.get(executor.id).user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                await sendLog(logChannel, memberRemoveRoleEmbed);
            }
        }
    } catch (error) {
        console.error('[GUILD MEMBER ROLE EVENT LOG] >> Error al registrar el cambio de roles de un miembro:', error);
    }
});
