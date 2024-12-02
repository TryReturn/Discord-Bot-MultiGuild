const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Suggestion = require('../../database/models/SuggestModel');
const PremiumGuild = require('../../database/models/GuildPremiumModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetsuggest')
        .setDescription('🔙💎 Restablece el estado anterior de una sugerencia')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('📰 ID de la sugerencia a restablecer.')
                .setRequired(true)),
    premium: true,
    async run(client, interaction) {
        const suggestionID = interaction.options.getString('id');
        const user = interaction.user;
        const guildId = interaction.guildId;

        try {
            const isPremium = await verificarPremium(guildId);

            if (!isPremium) {
                const notPremiumEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('**SUGERENCIAS** | Comando Restringido')
                    .setDescription('➜ Esta funcionalidad solo está disponible en servidores premium. Para obtener acceso, considera mejorar a la versión premium de nuestro bot.');

                return interaction.reply({ embeds: [notPremiumEmbed], ephemeral: true });
            }

            if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                const noPermissionEmbed = new MessageEmbed()
                  .setColor('RED')
                  .setTitle('**SUGERENCIAS** | Permisos Insuficientes')
                  .setDescription('➜ Debes tener permisos de `MANAGE_CHANNELS` para ejecutar este comando.');
          
                return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
              }

            const suggestion = await Suggestion.findOne({ id: suggestionID }).exec();

            if (!suggestion) {
                const notFoundEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('**SUGERENCIAS** | Sugerencia no Encontrada')
                    .setDescription(`➜ No se encontró ninguna sugerencia con el ID: **${suggestionID}**.`);

                return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
            }

            suggestion.estado = 'Voting';
            await suggestion.save();

            const successEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('**SUGERENCIAS** | Restablecimiento Exitoso')
                .setDescription(`➜ Se restableció con éxito la sugerencia con el ID: **${suggestionID}** al estado de **https://github.com/TryReturn **.`);

            interaction.reply({ embeds: [successEmbed], ephemeral: true  });
        } catch (error) {
            console.error('[CONSOLE RESETSUGGEST SLASH ERROR] >> Error al restablecer la sugerencia:', error);
            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**SUGERENCIAS** | Error de Restablecimiento')
                .setDescription('➜ Error al restablecer la sugerencia. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },

    async verificarPremium(guildId) {
        try {
            const premiumGuild = await PremiumGuild.findOne({ guildId }).exec();
            return premiumGuild !== null;
        } catch (error) {
            return false;
        }
    },
};
