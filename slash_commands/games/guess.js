const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('🎲 Juego de adivinanzas. Intenta adivinar un número entre 1 y 100.'),
    async run(client, interaction) {
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        let attempts = 0;
        let gameEnded = false;

        const filter = response => {
            const guess = parseInt(response.content);
            attempts++;

            return !isNaN(guess) && guess >= 1 && guess <= 100;
        };

        const guessEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('🎲 Adivina el número')
            .setDescription('➜ Intenta adivinar un **número** entre 1 y 100\nen la menor cantidad de **números** posible.');

        await interaction.reply({ embeds: [guessEmbed] });

        const collector = interaction.channel.createMessageCollector({
            filter,
            time: 60000,
        });

        collector.on('collect', response => {
            const guess = parseInt(response.content);

            if (guess === randomNumber) {
                collector.stop();
                gameEnded = true;
                const winEmbed = new MessageEmbed()
                    .setColor('#00ff00')
                    .setTitle('🎉 ¡Felicidades has Acertado!')
                    .setDescription(`¡Adivinaste; el número era **${randomNumber}** en **${attempts} números**!`);

                interaction.followUp({ embeds: [winEmbed] });
            } else if (guess < randomNumber) {
                const higherEmbed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setDescription(`🔺 El número es mayor que **${guess}**. Intenta de nuevo.`);

                interaction.followUp({ embeds: [higherEmbed] });
            } else {
                const lowerEmbed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setDescription(`🔻 El número es menor que **${guess}**. Intenta de nuevo.`);

                interaction.followUp({ embeds: [lowerEmbed] });
            }
        });

        collector.on('end', () => {
            if (!gameEnded) {
                const timeUpEmbed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setDescription(`⏳ Se acabó el tiempo. El número era **${randomNumber}**.`);

                interaction.followUp({ embeds: [timeUpEmbed], ephemeral: true });
            }
        });
    },
};
