const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const PremiumGuild = require('../../database/models/GuildPremiumModel');

async function verificarPremium(guildId) {
    try {
        const premiumGuild = await PremiumGuild.findOne({ guildId }).exec();
        return premiumGuild !== null;
    } catch (error) {
        return false;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('📊 Crea una nueva encuesta')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('📊 Crea una nueva encuesta')
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('📮📝 El canal donde se enviará la encuesta.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('pregunta')
                        .setDescription('📝 El título de la encuesta.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('emoji1')
                        .setDescription('📂 Emoji para la primera opción.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('descripcion1')
                        .setDescription('📰 Descripción de la primera opción.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('emoji2')
                        .setDescription('📂 Emoji para la segunda opción.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('descripcion2')
                        .setDescription('📰 Descripción de la segunda opción.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('imagen')
                        .setDescription('🔗 URL de la imagen para la encuesta.'))
                .addRoleOption(option =>
                    option.setName('rol')
                        .setDescription('💼 Rol a mencionar antes de la encuesta.'))),
    async run(client, interaction) {
        try {
            if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                const noPermissionEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('**PERMISO DENEGADO** | Permisos Insuficientes')
                    .setDescription('➜ Debes tener permisos de `ADMINISTRATOR` para ejecutar este comando.');
                return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: false });
            }

            const subcommand = interaction.options.getSubcommand();
            const guild = interaction.guild;

            if (subcommand === 'create') {
                const canal = interaction.options.getChannel('canal');
                const pregunta = interaction.options.getString('pregunta');
                const emoji1 = interaction.options.getString('emoji1');
                const descripcion1 = interaction.options.getString('descripcion1');
                const emoji2 = interaction.options.getString('emoji2');
                const descripcion2 = interaction.options.getString('descripcion2');
                const imagen = interaction.options.getString('imagen');

                const rolOption = interaction.options.getRole('rol');

                if (!pregunta || !descripcion1 || !descripcion2) {
                    await interaction.reply(':warning: ➜ Por favor, proporciona un título y dos descripciones válidas para la encuesta.');
                    return;
                }

                let mentionString = '**Encuesta Pública.**';
                if (rolOption) {
                    mentionString = `<@&${rolOption.id}>`;
                    if (rolOption.id === guild.id) mentionString = '@everyone';
                }

                let footerText = 'Powered - TryReturn [DEV]';
                let footerIcon = '';

                const isPremium = await verificarPremium(interaction.guildId);
                if (isPremium) {
                    footerText = interaction.guild.name;
                    footerIcon = interaction.guild.iconURL();
                }

                const successEmbed = new MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('**ENCUESTA** | Encuesta Creada')
                    .setDescription(`Se ha creado la encuesta "**${pregunta}**" en ${canal}. Información Recolectada.`)
                    .addFields(
                        { name: 'Opción 1', value: `${emoji1} ${descripcion1}`, inline: false },
                        { name: 'Opción 2', value: `${emoji2} ${descripcion2}`, inline: false },
                        { name: 'Canal de la Encuesta', value: `${canal}`, inline: false },
                        { name: 'Título', value: `${pregunta}`, inline: false },
                        { name: 'Rol mencionado', value: `${mentionString}`, inline: false },
                        { name: 'Imagenes Adjuntadas', value: `${imagen ? 'Sí' : 'No'}`, inline: false }
                    );

                const mensajeEncuesta = await canal.send({ content: mentionString });

                const encuestaEmbed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(pregunta)
                    .setImage(imagen)
                    .addFields(
                        { name: 'Opción 1', value: `${emoji1} - ${descripcion1}`, inline: false },
                        { name: 'Opción 2', value: `${emoji2} - ${descripcion2}`, inline: false }
                    )
                    .setFooter({ text: footerText, iconURL: footerIcon })
                    .setTimestamp();

                await mensajeEncuesta.edit({ embeds: [encuestaEmbed] });

                await mensajeEncuesta.react(emoji1);
                await mensajeEncuesta.react(emoji2);

                interaction.reply({ embeds: [successEmbed], ephemeral: true });
            }
        } catch (error) {
            console.error('[POLL CREATE SLASH ERROR LOG] >> Error al crear la encuesta:', error);

            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**ENCUESTA** | Error al Crear')
                .setDescription('➜ Hubo un error al crear la encuesta. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
