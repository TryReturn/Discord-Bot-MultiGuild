const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const star = require('star-labs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('💋 Besa a alguien apasionadamente')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('👥 Usuario al que deseas besar.')
                .setRequired(true)),
    async run(client, interaction) {
        const userToKiss = interaction.options.getUser('usuario');
        const sender = interaction.user;

        const kissEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setDescription(`**${sender.tag}** ha besado apasionadamente a **${userToKiss.tag}**`)
            .setImage(star.kiss())
            .setTimestamp();

        interaction.reply({ embeds: [kissEmbed] });
    },
};
