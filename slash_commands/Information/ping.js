const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🏓 Muestra el ping del bot'),
    async run(client, interaction) {
        try {
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('ping_button')
                        .setLabel('Recargar')
                        .setStyle('PRIMARY')
                );

            const pingEmbed = new MessageEmbed()
                .setColor('RANDOM')
                .setTitle('🏓 Pong!')
                .setDescription('Calculando el ping...');

            const message = await interaction.reply({ embeds: [pingEmbed], components: [row], fetchReply: true });

            if (!message) {
                console.error('[PING SLASH ERROR LOG] >> Message is undefined');
                return;
            }

            const ping = message.createdTimestamp - interaction.createdTimestamp;

            pingEmbed.setDescription(`¡Pong! 🏓\nLatencia de API: ${ping}ms | Latencia del bot: ${client.ws.ping}ms`);

            await message.edit({ embeds: [pingEmbed], components: [] });
        } catch (error) {
            console.error('[PING SLASH ERROR LOG] >>', error);
            interaction.followUp(':warning: ➜ Error al ejecutar el comando de ping. __Contacta con un developer si el error persiste.__');
        }
    },
};
