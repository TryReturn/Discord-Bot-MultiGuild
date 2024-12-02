const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const VoiceSetupModel = require('../../database/models/VoiceSetupModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voice')
        .setDescription('🔐 Configura el sistema de salas privadas')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('🔧 Configura un canal de voz para crear salas privadas')
                .addChannelOption(option => 
                    option.setName('canal')
                        .setDescription('📮 Selecciona el canal de voz donde se crearán las salas privadas')
                        .setRequired(true)
                        .addChannelTypes(2)) 
                .addChannelOption(option => 
                    option.setName('categoria')
                        .setDescription('📝 Selecciona la categoría donde se crearán las salas privadas')
                        .setRequired(false))),
    async run(client, interaction) {
        const canalVoz = interaction.options.getChannel('canal');
        const categoria = interaction.options.getChannel('categoria');

        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**VOICE SETUP** | Permisos Insuficientes')
                .setDescription('➜ Debes tener permisos de `ADMINISTRATOR` para ejecutar este comando.');
            return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: false });
          }

        if (canalVoz.type !== 'GUILD_VOICE') {
            return interaction.reply({ content: ' **VOICE SETUP** | ➜ El canal seleccionado debe ser un canal de voz.', ephemeral: true });
        }

        try {
            const existingSetup = await VoiceSetupModel.findOne({ serverId: interaction.guild.id });
            if (existingSetup) {
                existingSetup.voiceChannelId = canalVoz.id;
                existingSetup.categoryId = categoria ? categoria.id : null;
                await existingSetup.save();
            } else {
                const newSetup = new VoiceSetupModel({
                    serverId: interaction.guild.id,
                    voiceChannelId: canalVoz.id,
                    categoryId: categoria ? categoria.id : null,
                });
                await newSetup.save();
            }

            const NoCategory = "Si no se selecciona una categoría, los canales se crearán al inicio del servidor.";

            const embed = new MessageEmbed()
                .setColor('ORANGE')
                .setTitle('**VOICE SETUP** | Configuración de Salas Privadas')
                .setDescription('➜ ¡El canal de voz y la categoría se han configurado correctamente!')
                .addFields(
                    { name: ' __Canal de Voz__', value: `<#${canalVoz.id}>`, inline: true },
                    { name: ' __Categoría__', value: categoria ? `<#${categoria.id}>` : '||No especificada||', inline: true },
                    { name: ' __Información__', value: NoCategory, inline: false } 
                )
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('[VOICE SETUP ERROR LOG] >> Error al guardar la configuración:', error);
            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**VOICE SETUP** | Error al Gestionar el Servidor')
                .setDescription('➜ Hubo un error al almacenar los canales. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
