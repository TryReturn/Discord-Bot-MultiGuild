const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff-check')
        .setDescription('⭐ Verifica si un miembro es parte del personal')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('👥 El usuario que quieres verificar.')),
    async run(client, interaction) {
        const staffList = JSON.parse(fs.readFileSync('stafflist.json', 'utf-8'));

        const targetUser = interaction.options.getUser('usuario') || interaction.user;

        const isStaff = staffList.includes(targetUser.id);

        const embed = new MessageEmbed()
            .setTitle('Verificación del Personal')
            .setDescription(`➜ ${targetUser}: ${isStaff ? 'Si es moderador de Folk Suggest' : 'No es moderador de Folk Suggest'}`)
            .setColor(isStaff ? 'GREEN' : 'RED');

        await interaction.reply({ embeds: [embed], ephemeral: false });
    },
};
