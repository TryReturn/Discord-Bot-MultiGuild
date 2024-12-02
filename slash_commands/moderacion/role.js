const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const ModLogModel = require('../../database/models/ModLogModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('📝 Agregar o eliminar un rol del usuario')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('📝 Agregar un rol al usuario')
                .addUserOption(option => option.setName('usuario')
                    .setDescription('👥 El usuario al que deseas agregar el rol.')
                    .setRequired(true))
                .addRoleOption(option => option.setName('rol')
                    .setDescription('💼 El rol que deseas agregar.')
                    .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('📝 Eliminar un rol del usuario')
                .addUserOption(option => option.setName('usuario')
                    .setDescription('👥 El usuario al que deseas eliminar el rol.')
                    .setRequired(true))
                .addRoleOption(option => option.setName('rol')
                    .setDescription('💼 El rol que deseas eliminar.')
                    .setRequired(true))
        ),
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
            const usuario = interaction.options.getMember('usuario');
            const rol = interaction.options.getRole('rol');
            const guildId = interaction.guildId;

            let responseEmbed;

            if (subcommand === 'add') {
                await usuario.roles.add(rol);
                responseEmbed = new MessageEmbed()
                    .setColor('#00ff00')
                    .setTitle('**ROLES** | Establecido')
                    .setDescription(`➜ Se ha agregado el rol ${rol} al miembro ${usuario} correctamente.`);
            } else if (subcommand === 'remove') {
                await usuario.roles.remove(rol);
                responseEmbed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('**ROLES** | Removido')
                    .setDescription(`➜ Se ha eliminado el rol ${rol} del miembro ${usuario} correctamente.`);
            }

            const logsChannelData = await ModLogModel.findOne({ guildId }).exec();

            if (logsChannelData) {
                const logsChannel = interaction.guild.channels.cache.get(logsChannelData.channelId);
                if (logsChannel && logsChannel.isText()) {
                    const logEmbed = new MessageEmbed()
                        .setColor('ORANGE')
                        .setTitle('**MOD LOGS** | Registro de Acción de Roles')
                        .setDescription(`➥ **Moderador:** ${interaction.user}\n➥ **Acción:** ${subcommand}\n➥ **Usuario:** ${usuario}\n➥ **Rol:** ${rol}`);

                    logsChannel.send({ embeds: [logEmbed] });
                }
            }

            await interaction.reply({ embeds: [responseEmbed], ephemeral: true });
        } catch (error) {
            console.error('[ROLE ADD/REMOVE SLASH ERROR LOG] >> Error al ejecutar el comando de rol:', error);

            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**ROLES** | Error de Establecimiento')
                .setDescription('➜ Error al establecer los otorgamientos. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
