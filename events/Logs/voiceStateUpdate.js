const { MessageEmbed, Permissions } = require("discord.js");
const LogsChannel = require('../../database/models/ModLogModel');
const VoiceSetupModel = require('..//..//database/models/VoiceSetupModel'); // Ajusta la ruta si es necesario
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

client.on('voiceStateUpdate', async (oldState, newState) => {
    const guild = newState.guild;
    const user = newState.member.user;

    if (oldState.channelId !== newState.channelId) {
        const channelId = newState.channelId || oldState.channelId;

        let action;
        let actionDescription;

        if (oldState.channelId && !newState.channelId) {
            action = 'LEAVE';
            actionDescription = 'Usuario salió del Canal de Voz';
        } else if (!oldState.channelId && newState.channelId) {
            action = 'JOIN';
            actionDescription = 'Usuario se unió a un Canal de Voz';
        }

        if (action) {
            const channel = guild.channels.cache.get(channelId);

            const embed = new MessageEmbed()
                .setColor('ORANGE')
                .setTitle(`**VOICE ${action}** | ${actionDescription}`)
                .setDescription(`**Usuario**: ${user}\n**Canal**: <#${channelId}>\n${actionDescription}.`)
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })
                .setTimestamp();

            embed.setThumbnail(user.avatarURL({ dynamic: true }));

            sendLog(guild.id, embed);
        }

        try {
            const setup = await VoiceSetupModel.findOne({ serverId: guild.id });
            if (setup && newState.channelId === setup.voiceChannelId) {
                const member = newState.member;
                const category = setup.categoryId ? await guild.channels.fetch(setup.categoryId) : null;

                const privateChannel = await guild.channels.create(`🔒 | ${member.user.username}'s Room`, {
                    type: 'GUILD_VOICE',
                    parent: category ? category.id : null,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [Permissions.FLAGS.VIEW_CHANNEL],
                        },
                        {
                            id: member.id,
                            allow: [
                                Permissions.FLAGS.VIEW_CHANNEL,
                                Permissions.FLAGS.CONNECT,
                                Permissions.FLAGS.MANAGE_CHANNELS,
                                Permissions.FLAGS.MANAGE_ROLES,
                            ],
                        },
                    ],
                });

                await member.voice.setChannel(privateChannel);

                const checkEmpty = setInterval(async () => {
                    if (privateChannel.members.size === 0) {
                        clearInterval(checkEmpty);
                        await privateChannel.delete();
                    }
                }, 15000);
            }
        } catch (error) {
            console.error('Error al crear la sala privada:', error);
        }
    }

    if (oldState.serverMute !== newState.serverMute) {
        if (!oldState.serverMute && newState.serverMute) {
            const auditLogs = await guild.fetchAuditLogs({ type: 'MEMBER_UPDATE', limit: 1 });
            const auditEntry = auditLogs.entries.first();

            if (!auditEntry) return;

            const executor = auditEntry.executor;

            const embed = new MessageEmbed()
                .setColor('ORANGE')
                .setTitle(`**VOICE MUTE** | Usuario fue muteado`)
                .setDescription(`**Usuario**: ${user}\nUsuario fue muteado.`)
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })
                .setTimestamp();

            if (executor) {
                embed.setThumbnail(executor.avatarURL({ dynamic: true }));
                embed.setDescription(`**Usuario**: ${user}\nUsuario fue muteado por: ${executor}`);
            }

            sendLog(guild.id, embed);
        } else if (oldState.serverMute && !newState.serverMute) {
            const auditLogs = await guild.fetchAuditLogs({ type: 'MEMBER_UPDATE', limit: 1 });
            const auditEntry = auditLogs.entries.first();

            if (!auditEntry) return;

            const executor = auditEntry.executor;

            const embed = new MessageEmbed()
                .setColor('ORANGE')
                .setTitle(`**VOICE UNMUTE** | Usuario fue desmuteado`)
                .setDescription(`**Usuario**: ${user}\nUsuario fue desmuteado.`)
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })
                .setTimestamp();

            if (executor) {
                embed.setThumbnail(executor.avatarURL({ dynamic: true }));
                embed.setDescription(`**Usuario**: ${user}\nUsuario fue desmuteado por: ${executor}`);
            }

            sendLog(guild.id, embed);
        }
    }
});
