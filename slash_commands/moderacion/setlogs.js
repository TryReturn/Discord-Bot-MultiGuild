const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const ModLogModel = require('../../database/models/ModLogModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('🔧 Configura el canal de registros')
        .addChannelOption(option =>
            option.setName('new_channel')
                .setDescription('📮 Define el canal de registros del servidor.')
                .setRequired(true)),

    async run(client, interaction) {
        try {
            const memberPermissions = interaction.member.permissions;

            if (!memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                const noPermissionEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('**MOD LOGS** | Permisos Insuficientes')
                    .setDescription('➜ Debes tener permisos de `ADMINISTRATOR` para ejecutar este comando.');

                return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: false });
            }

            const channelOption = interaction.options.getChannel('new_channel');

            if (!channelOption || !channelOption.isText()) {
                const invalidChannelEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('**MOD LOGS** | Canal Inválido')
                    .setDescription('➜ El canal de registros debe ser un canal de texto.');

                return interaction.reply({ embeds: [invalidChannelEmbed], ephemeral: true });
            }

            const channelId = channelOption.id;
            const guildId = interaction.guildId;

            const logsChannel = await ModLogModel.findOneAndUpdate(
                { guildId },
                { channelId },
                { new: true, upsert: true }
            );

            const successEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('**MOD LOGS** | Canal de Registros Configurado')
                .setDescription(`➜ El canal de registros se ha configurado correctamente en <#${channelId}>.`);

            interaction.reply({ embeds: [successEmbed], ephemeral: true });

            const newLogsChannelEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**SET LOGS** | Nuevo Canal de Registros')
                .setDescription(`➥ Se ha establecido <#${channelId}> como el nuevo canal de registros\nPara acciones del bot <@1210959526413606912>.`);

            const logsChannelObject = interaction.guild.channels.cache.get(channelId);
            if (logsChannelObject && logsChannelObject.isText()) {
                logsChannelObject.send({ embeds: [newLogsChannelEmbed] });
            }
        } catch (error) {
            console.error('[SETLOGS SLASH ERROR LOG] >> Error al configurar el canal de registros:', error);
            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**MOD LOGS** | Error al Configurar')
                .setDescription('➜ Hubo un error al configurar el canal de registros. Por favor, inténtalo de nuevo. __Contacta con un desarrollador si el error persiste.__');

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
