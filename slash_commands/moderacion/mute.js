const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const ms = require('ms');
const ModLogModel = require('../../database/models/ModLogModel');

function formatTime(duration) {
    const timeComponents = {
        days: Math.floor(duration / (1000 * 60 * 60 * 24)),
        hours: Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((duration % (1000 * 60)) / 1000)
    };

    let formattedTime = '';
    for (const [unit, value] of Object.entries(timeComponents)) {
        if (value > 0) formattedTime += `${value} ${unit} `;
    }

    return formattedTime.trim();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('🔨 Aislar a un usuario temporalmente')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('👥 Usuario que será aislado.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tiempo')
                .setDescription('⏰ El tiempo que el usuario será aislado (ej. 1d, 1h, 1m).')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('📝 Razón por la cual el usuario será muteado.')
                .setRequired(false)),
    async run(client, interaction) {
        try {
            const member = interaction.member;
            const guild = interaction.guild;

            if (!member.permissions.has(Permissions.FLAGS.MUTE_MEMBERS)) {
                const noPermissionEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('**MUTE** | Permisos Insuficientes')
                    .setDescription('➜ Debes tener permisos de `MUTE_MEMBERS` para ejecutar este comando.');

                return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: false });
            }

            const targetUser = interaction.options.getUser('usuario');
            const muteDuration = ms(interaction.options.getString('tiempo'));
            const formattedDuration = formatTime(muteDuration);
            const reason = interaction.options.getString('razon') || 'Mal Comportamiento.';
            const targetMember = await guild.members.fetch(targetUser.id);

            if (targetMember.timeout.active) {
                const alreadyMutedEmbed = new MessageEmbed()
                    .setColor('YELLOW')
                    .setTitle('**MUTE** | Usuario Ya Aislado')
                    .setDescription('➜ Este usuario ya está aislado.');

                return interaction.reply({ embeds: [alreadyMutedEmbed], ephemeral: true });
            }

            if (targetMember.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                const adminRoleEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('**MUTE** | Usuario con Rol de Administrador')
                    .setDescription('➜ No se puede aislar a un usuario con un rol que tiene permisos de administrador.');

                return interaction.reply({ embeds: [adminRoleEmbed], ephemeral: true });
            }

            await targetMember.timeout(muteDuration, reason);

            const modlogEmbed = new MessageEmbed()
                .setColor('ORANGE')
                .setTitle('**MOD LOGS** | Aislamiento de un Usuario')
                .setDescription(`➥ **Usuario Aislado:** ${targetUser}\n➥ **Tiempo:** ${formattedDuration}\n➥ **Razón:** ${reason}\n➥ **Moderador:** ${interaction.user}`)
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })
                .setTimestamp();

            const logsChannelData = await ModLogModel.findOne({ guildId: guild.id }).exec();
            if (logsChannelData) {
                const logsChannel = guild.channels.cache.get(logsChannelData.channelId);
                if (logsChannel && logsChannel.isText()) {
                    logsChannel.send({ embeds: [modlogEmbed] });
                }
            }

            const successEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('**MUTE** | Aislamiento Exitoso')
                .setDescription(`➜ El usuario ${targetUser} ha sido **__aislado__** correctamente por ${formattedDuration}.`);

            interaction.reply({ embeds: [successEmbed], ephemeral: true });

            setTimeout(async () => {
                await targetMember.timeout(0);

                const unmuteEmbed = new MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('**MOD LOGS** | Usuario Desaislado')
                    .setDescription(`➥ El usuario ${targetUser} ha sido **__desaislado__** automáticamente después de expirar su sanción de __**muteo**__.`);
                
                if (logsChannelData) {
                    const logsChannel = guild.channels.cache.get(logsChannelData.channelId);
                    if (logsChannel && logsChannel.isText()) {
                        logsChannel.send({ embeds: [unmuteEmbed] });
                    }
                }
            }, muteDuration);

        } catch (error) {
            console.error('[MUTE SLASH ERROR LOG] >> Error al ejecutar el comando:', error);
            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**MUTE** | Error al Aislar al Usuario')
                .setDescription('➜ Hubo un error al aislar al usuario. Por favor, inténtalo de nuevo. __Contacta con un desarrollador si el error persiste.__');

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
