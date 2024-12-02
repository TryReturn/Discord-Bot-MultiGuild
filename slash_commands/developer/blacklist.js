const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const BlacklistModel = require('../../database/models/BlacklistModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('📓 Administra la lista negra de usuarios (Dev. Only)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('👥 Añade un usuario a la lista negra')
                .addStringOption(option =>
                    option.setName('usuario').setDescription('📬 ID del usuario a añadir.').setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('razon').setDescription('📜 Motivo del blacklist.').setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('👥 Elimina un usuario de la lista negra')
                .addStringOption(option =>
                    option.setName('usuario').setDescription('📬 ID del usuario a eliminar.').setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('list').setDescription('💻 Muestra la lista negra')
        ),
    async run(client, interaction) {
        const allowedUserIDs = ['828991790324514887', '944622203792658485'];

        if (!allowedUserIDs.includes(interaction.user.id)) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('**BLACKLIST** | Denegado')
                .setDescription('No tienes permisos para ejecutar este comando.');

            return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            try {
                const userIdToAdd = interaction.options.getString('usuario').toString();
                const userToAdd = await client.users.fetch(userIdToAdd);
                const reason = interaction.options.getString('razon') || 'Payasito.com';

                const existingUser = await BlacklistModel.findOne({ userId: userIdToAdd });

                if (!existingUser || !existingUser.isBanned) {
                    const newUser = new BlacklistModel({
                        userId: userIdToAdd,
                        username: userToAdd.username || "UnknownUser",
                        isBanned: true,
                        reason: reason,
                    });

                    await newUser.save();

                    const successEmbed = new MessageEmbed()
                        .setColor('#00ff00')
                        .setTitle('**BLACKLIST** | Usuario Añadido')
                        .setDescription(`Usuario con ID ${userIdToAdd} (${userToAdd.tag}) añadido a la lista negra.\nRazón: ${reason}`);

                    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                } else {
                    const alreadyInListEmbed = new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('**BLACKLIST** | Usuario Baneado')
                        .setDescription(`El usuario con ID ${userIdToAdd} (${userToAdd.tag}) ya está en la lista negra.`);

                    await interaction.reply({ embeds: [alreadyInListEmbed], ephemeral: true });
                }
            } catch (error) {
                console.error('[BLACKLIST ERROR LOG] >> Error al procesar el comando add:', error);
                return interaction.reply(':warning: Se produjo un error al procesar el comando add. __Contacta con un developer si el error persiste.__');
            }
        } else if (subcommand === 'remove') {
            try {
                const userIdToRemove = interaction.options.getString('usuario');
                const userToRemove = await client.users.fetch(userIdToRemove);

                if (!userToRemove) {
                    return interaction.reply(":warning: No se pudo obtener la información del usuario. __Contacta con un developer si el error persiste.__");
                }

                const deletedUser = await BlacklistModel.findOneAndDelete({ userId: userIdToRemove, isBanned: true });

                if (deletedUser) {
                    const successRemoveEmbed = new MessageEmbed()
                        .setColor('#00ff00')
                        .setTitle('**BLACKLIST** | Usuario Eliminado')
                        .setDescription(`Usuario con ID ${userIdToRemove} (${userToRemove.tag}) eliminado de la lista negra.`);

                    await interaction.reply({ embeds: [successRemoveEmbed], ephemeral: true });
                } else {
                    const notInListEmbed = new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('**BLACKLIST** | Usuario no Baneado')
                        .setDescription(`El usuario con ID ${userIdToRemove} (${userToRemove.tag}) no está en la lista negra.`);

                    await interaction.reply({ embeds: [notInListEmbed], ephemeral: true });
                }
            } catch (error) {
                console.error('[BLACKLIST ERROR LOG] >> Error al procesar el comando remove:', error);
                return interaction.reply(':warning: Se produjo un error al procesar el comando remove. __Contacta con un developer si el error persiste.__');
            }
        } else if (subcommand === 'list') {
            try {
                const bannedUsers = await BlacklistModel.find({ isBanned: true });

                if (bannedUsers.length > 0) {
                    const embed = new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('**BLACKLIST** | Lista Negra')
                        .setDescription(
                            bannedUsers.map(user => `<@${user.userId}> (${user.userId}) | Razón: ${user.reason}`).join('\n')
                        );

                    await interaction.reply({ embeds: [embed] });
                } else {
                    const emptyListEmbed = new MessageEmbed()
                        .setColor('#00ff00')
                        .setTitle('**BLACKLIST** | Lista Negra')
                        .setDescription('La lista negra está vacía :o.');

                    await interaction.reply({ embeds: [emptyListEmbed] });
                }
            } catch (error) {
                console.error('[BLACKLIST ERROR LOG] >> Error al procesar el comando list:', error);

                return interaction.reply(':warning: Se produjo un error al procesar el comando list. __Contacta con un developer si el error persiste.__');
            }
        }
    },
};
