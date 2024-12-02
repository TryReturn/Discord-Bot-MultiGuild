const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('🔮 Hazle una pregunta a la bola mágica')
        .addStringOption(option =>
            option.setName('pregunta')
                .setDescription('❓ La pregunta que deseas hacerle a la bola mágica.')
                .setRequired(true)),
    async run(client, interaction) {
        const respuestas = [
            'Sí', 'No', 'Es probable', 'No puedo predecir ahora', 'No cuentes con ello',
            'Definitivamente sí', 'Definitivamente no', 'Pregunta de nuevo más tarde',
            'No estoy seguro', 'No hay duda', 'Espero que sí', 'Espero que no', 'En tus sueños',
            'Mejor no decirte ahora', 'No se puede prever en este momento',
            'Concéntrate y pregunta de nuevo', 'No cuentes con ello', 'Mi respuesta es no',
            'Mis fuentes dicen que no', 'Outlook no es muy bueno', 'Muy dudoso',
        ];

        const guild = interaction.guild;
        const pregunta = interaction.options.getString('pregunta');

        if (pregunta.length > 60) {
            return interaction.reply({ content: '❌ La pregunta no puede tener más de **60 caracteres**.', ephemeral: true });
        }

        const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];

        const embed = new MessageEmbed()
            .setColor('#3498db')
            .setTitle('Bola Mágica 🔮')
            .addFields(
                { name: '__Pregunta__', value: pregunta },
                { name: '__Respuesta__', value: respuesta }
            )
            .setFooter({ text: guild.name, iconURL: guild.iconURL() });

        await interaction.reply({ embeds: [embed] });
    },
};
