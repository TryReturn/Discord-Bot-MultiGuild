const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription(' Muestra información del bot'),

    async run(client, interaction) {
        const botPages = 'https://disboard.org/es/server/1210981966288126022\nhttps://infinitybots.gg/bot/1210959526413606912';
        const devInfo = '[QrIvan#0105](https://interactionrun.carrd.co/)';

        const voteEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle('📡 **|** Información del bot')
            .addFields(
                { name: '``👑`` | Developers', value: devInfo, inline: true },
                { name: '``⚡`` | Total de Usuarios', value: interaction.client.users.cache.size.toString(), inline: true },
                { name: '``🖥️`` | Cantidad de Servidores', value: interaction.client.guilds.cache.size.toString(), inline: true },
                { name: '``🤖`` | Versión del Bot', value: 'v8.2.0', inline: true },
                { name: '``💻`` | Página de votos', value: botPages, inline: false },
                { name: '``🔗`` | Links Oficiales', value: '[Añádeme Aquí](https://rebrand.ly/folkinvite) **⟺** [Discord de Soporte](https://rebrand.ly/folkdiscord)' }
            )
            .setFooter({ text: 'Folk Suggest | ¡Gracias por usar nuestro Template-Bot! ❤️', iconURL: client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [voteEmbed] });
    },
};
