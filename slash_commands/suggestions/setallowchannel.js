const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, TextChannel, Permissions } = require('discord.js');
const AllowChannelModel = require('../../database/models/AllowChannelModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setallowchannel')
        .setDescription('🔧 Configura el canal permitido para usar /suggest')
        .addChannelOption(option =>
            option.setName('new_channel')
                .setDescription('📮 Define el canal para usar el comando de sugerencias del servidor.')
                .setRequired(true)),
    async run(client, interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**PERMISO DENEGADO** | Permisos Insuficientes')
                .setDescription('➜ Debes tener permisos de `ADMINISTRATOR` para ejecutar este comando.');
          
                return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
        }

        const allowedChannel = interaction.options.getChannel('new_channel');
        const channelId = allowedChannel.id;
        const serverId = interaction.guild.id;

        try {
            let serverChannel = await AllowChannelModel.findOne({ serverId });

            if (!serverChannel) {
                serverChannel = new AllowChannelModel({
                    serverId,
                    allowedChannelId: channelId,
                });
            } else {
                serverChannel.allowedChannelId = channelId;
            }

            await serverChannel.save();

            const successEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('**CONFIGURACIÓN DE SUGERENCIAS** | Canal Configurado')
                .setDescription(`➜ El canal de sugerencias se ha configurado correctamente en <#${channelId}>. https://github.com/TryReturn `);

            interaction.reply({ embeds: [successEmbed], ephemeral: true });
        } catch (error) {
            console.error('[SETALLOW-CHANNEL SLAHS ERROR LOG] >> Error al configurar el canal de sugerencias:', error);
            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**CONFIGURACIÓN DE SUGERENCIAS** | Error')
                .setDescription('➜ Error al configurar el canal de sugerencias. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
