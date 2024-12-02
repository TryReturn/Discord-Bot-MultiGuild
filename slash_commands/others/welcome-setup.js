const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const welcomeSchema = require("../../database/models/welcomeSystem.js");
const client = require('../../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-setup')
        .setDescription('🔧 Configura tus mensajes de bienvenida.')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('📮 Canal de mensajes de bienvenida.')
                .setRequired(true)
                .addChannelTypes(0)
        )
        .addStringOption(option => 
            option.setName('welcome-message')
                .setDescription('📝 Introduzca un mensaje de bienvenida.')
                .setRequired(true)),
    
    async run(client, interaction) {
        const welcomeChannel = interaction.options.getChannel('channel');
        const welcomeMessage = interaction.options.getString('welcome-message');

        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**WELCOME SETUP** | Permisos Insuficientes')
                .setDescription('➜ Debes tener permisos de `MANAGE_GUILD` para ejecutar este comando.');
            return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
        }

        if (!interaction.guild.me.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
            const botSinPermisoEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('**WELCOME SETUP** | Permiso Denegado')
                .setDescription('➜ El bot no tiene permisos para manejar el servidor.');
            return interaction.reply({ embeds: [botSinPermisoEmbed], ephemeral: true });
        }

        try {
            const data = await welcomeSchema.findOneAndUpdate(
                { guildID: interaction.guild.id }, 
                { guildID: interaction.guild.id, channelID: welcomeChannel.id, Msg: welcomeMessage }, 
                { upsert: true, new: true }
            );
        
            const successEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('**WELCOME SETUP** | Sistema de Bienvenidas Configurado')
                .setDescription(`➜ El sistema de bienvenidas se ha configurado correctamente en el canal ${welcomeChannel}. Con el mensaje **${welcomeMessage}**`);
        
            interaction.reply({ embeds: [successEmbed], ephemeral: true });
        
        } catch (error) {
            console.error('[WELCOME-SETUP] >> Error al configurar el sistema de bienvenidas:', error);
        
            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**WELCOME SETUP** | Configuración Fallida')
                .setDescription('➜ Hubo un error al configurar el canal de registros. Por favor, inténtalo de nuevo. __Contacta con un desarrollador si el error persiste.__');
        
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
