const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const PremiumGuild = require('../../database/models/GuildPremiumModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkpremium')
        .setDescription('📝💎 Verifica si el servidor tiene una suscripción premium activa'),
    async run(client, interaction) {
        try {
            const guildId = interaction.guildId;
            const isPremium = await checkPremium(guildId);

            if (isPremium) {
                return interaction.reply({ content: '🌟 | Este servidor tiene una suscripción premium activa. ¡Gracias por tu apoyo!\n➜ **Premium Tier activated**', ephemeral: false });
            } else {
                return interaction.reply({ content: '🔒 | Este servidor no tiene una suscripción premium activa. ¡Considera apoyarnos con una suscripción en nuestro Discord!', ephemeral: false });
            }
        } catch (error) {
            console.error('[CHECK PREMIUM ERROR LOG] >> Error al ejecutar el comando checkpremium:', error);
            return interaction.reply({ content: ':warning: ➜ Hubo un error al ejecutar el comando checkpremium. __Contacta con un developer si el error persiste.__', ephemeral: true });
        }
    }
};

async function checkPremium(guildId) {
    try {
        const premiumGuild = await PremiumGuild.findOne({ guildId });
        return premiumGuild && !isExpired(premiumGuild.expireDate);
    } catch (error) {
        console.error('[CHECK PREMIUM ERROR LOG] >> Error al verificar premium:', error);
        return false;
    }
}

function isExpired(expireDate) {
    return expireDate <= Date.now();
}
