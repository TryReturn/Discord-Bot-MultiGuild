const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, WebhookClient } = require('discord.js');
const config = require('../../config.json');
const client = require('../../index.js');
const User = require('../../database/models/BlacklistModel');
const PremiumGuild = require('../../database/models/PremiumGuildModel');
const { v4: uuidv4 } = require('uuid');

client.on('interactionCreate', async (interaction) => {
    let errorWebhook;

    try {
        if (!interaction.isCommand()) return;

        const command = client.slash_commands.get(interaction.commandName);

        if (!command) return interaction.reply({ content: '🤖 | Este comando no es válido, probablemente el desarrollador lo haya eliminado.', ephemeral: true });

        const bannedUser = await User.findOne({ userId: interaction.user.id, isBanned: true });
        if (bannedUser) {
            const bannedEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('**BLACKLIST** | Acceso Denegado')
                .setDescription('➜ Estás en la lista negra y no puedes ejecutar comandos del bot. 🤡');
            return interaction.reply({ embeds: [bannedEmbed] });
        }

        const premiumGuild = await PremiumGuild.findOne({ guildId: interaction.guild.id });
        if (!premiumGuild) {
            const noPremiumEmbed = new MessageEmbed()
                .setColor('#ffcc00')
                .setTitle('Premium Requerido')
                .setDescription('Este servidor no tiene acceso Premium. Contacta al soporte para más información.');
            return interaction.reply({ embeds: [noPremiumEmbed], ephemeral: true });
        }

        const currentDate = new Date();
        if (premiumGuild.expireDate < currentDate) {
            const expiredEmbed = new MessageEmbed()
                .setColor('#ff9900')
                .setTitle('Premium Expirado')
                .setDescription('El acceso Premium de este servidor ha expirado. Renueva tu suscripción para continuar disfrutando de las funciones Premium.');
            return interaction.reply({ embeds: [expiredEmbed], ephemeral: true });
        }

        const webhookURL = 'YOUR_WEBHOOK';
        errorWebhook = new WebhookClient({ url: webhookURL });

        if (command.run) {
            await command.run(client, interaction);
        }
    } catch (e) {
        const errorId = uuidv4();
        console.error(`[INTERACTION CONSOLE ERROR] >> Error ID: ${errorId}\n` + e);

        if (errorWebhook) {
            sendErrorToWebhook(e, 'Interaction Handler', errorWebhook);
        }

        await interaction.reply({ content: `🤖 | ¡Algo salió mal al ejecutar el comando! Aquí está el ID del error que puede informar a los desarrolladores.: \`${errorId}\``, ephemeral: true });
    }
});

const errorId = uuidv4();

function sendErrorToWebhook(error, context, errorWebhook) {
    const errorEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle(`🤖 Error in Interaction Handler - ${context}`)
        .setDescription(`An error occurred while processing interactions.\n**(${errorId})**`)
        .addFields({ name: 'Error Details', value: `\`\`\`${error.message}\`\`\`` })
        .setTimestamp();

    errorWebhook.send({ embeds: [errorEmbed] });
}
