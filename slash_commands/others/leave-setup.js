const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const leaveSchema = require("../../database/models/leaveSystem");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave-setup')
        .setDescription('🔧 Configura tus mensajes de despedida.')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('📮 Canal de mensajes de despedida.')
                .setRequired(true)
                .addChannelTypes(0)
        )
        .addStringOption(option => 
            option.setName('leave-message')
                .setDescription('📝 Introduzca un mensaje de despedida.')
                .setRequired(true)),
    
    async run(client, interaction) {
        const leaveChannel = interaction.options.getChannel('channel');
        const leaveMessage = interaction.options.getString('leave-message');

        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**LEAVE SETUP** | Permisos Insuficientes')
                .setDescription('➜ Debes tener permisos de `MANAGE_GUILD` para ejecutar este comando.');
            return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
        }

        if (!interaction.guild.me.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
            const botSinPermisoEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('**LEAVE SETUP** | Permiso Denegado')
                .setDescription('➜ El bot no tiene permisos para manejar el servidor.');
            return interaction.reply({ embeds: [botSinPermisoEmbed], ephemeral: true });
        }

        try {
            await leaveSchema.findOneAndUpdate(
                { guildID: interaction.guild.id }, 
                { guildID: interaction.guild.id, channelID: leaveChannel.id, Msg: leaveMessage }, 
                { upsert: true, new: true }
            );
        
            const successEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('**LEAVE-SETUP** | Sistema de Despedidas Configurado')
                .setDescription(`➜ El sistema de despedidas se ha configurado correctamente en el canal ${leaveChannel}. Con el mensaje **${leaveMessage}**`);
        
            interaction.reply({ embeds: [successEmbed], ephemeral: true });
        
        } catch (error) {
            console.error('Error al configurar el sistema de despedidas:', error);
        
            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**ERROR** | Configuración Fallida')
                .setDescription('➜ Hubo un error al configurar el sistema de despedidas. Por favor, intenta de nuevo más tarde.');
        
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}
