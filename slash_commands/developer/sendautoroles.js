const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed, Permissions } = require('discord.js');
const ServerAutorole = require('../../database/models/ServerAutorole');
const client = require("..//..//index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendautoroles')
        .setDescription('📬 Envía el panel de autoroles al canal especificado.')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('📢 Selecciona el canal donde se enviará el panel de autoroles.')
                .setRequired(true)),

    async run(client, interaction) {
        const guildId = interaction.guildId;
        const channel = interaction.options.getChannel('canal');

        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**AUTOROLES** | Permisos Insuficientes')
                .setDescription('➜ Debes tener permisos de `ADMINISTRATOR` para ejecutar este comando.');
            return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
            const botSinPermisoEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('**AUTOROLES** | Permiso Denegado')
                .setDescription('➜ El bot no tiene permisos para gestionar el servidor.');
            return interaction.reply({ embeds: [botSinPermisoEmbed], ephemeral: true });
        }

        const serverAutorole = await ServerAutorole.findOne({ guildId }).exec();
        if (!serverAutorole) {
            return interaction.reply({ content: 'No se han establecido configuración autoroles en este servidor. __Contacta con el Equipo Administrativo del Servidor.__', ephemeral: true });
        }

        const { roles, descriptions } = serverAutorole;

        const options = roles.map((roleId, index) => {
            const role = interaction.guild.roles.cache.get(roleId);
            return {
                label: role ? role.name : 'Rol no encontrado',
                value: roleId,
                description: descriptions[index] || 'No hay descripción disponible',
            };
        });
        

        const selectMenu = new MessageSelectMenu()
            .setCustomId('autorole_select')
            .setPlaceholder('🌈 ➜ Selecciona tus notificaciones')
            .addOptions(options);

        const row = new MessageActionRow().addComponents(selectMenu);

        const server = interaction.guild;

        const embed = new MessageEmbed()
        .setColor('ORANGE')
        .setTitle(`${interaction.guild.name} | AutoRoles`)
        .setThumbnail(server.iconURL({ dynamic: true }))
        .setDescription(`**!HOLA!** Aquí puedes seleccionar de qué contenido quieres **__recibir notificaciones__**. **Aquí tienes las opciones disponibles**:\n\n${options.map(option => `<@&${option.value}> - ${option.description}`).join('\n\n')}`)
        .setFooter({ text: 'Powered - TryReturn [DEV]', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

        const message = await channel.send({ embeds: [embed], components: [row] });
        message.options = options;

        return interaction.reply({ content: `➜ El panel de autoroles ha sido enviado correctamente. ${channel}`, ephemeral: true });
    }
};

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId === 'autorole_select') {
        const selectedRoleId = interaction.values[0];
        const role = interaction.guild.roles.cache.get(selectedRoleId);

        if (role) {
            if (interaction.member.roles.cache.has(role.id)) {
                const removeRoleEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('| AutoRol Removido')
                    .setDescription(`🚨 ➜ Se te ha removido el rol <@&${role.id}>.`);
                    
                await interaction.reply({ embeds: [removeRoleEmbed], ephemeral: true });
                await interaction.member.roles.remove(role);
            } else {
                const assignRoleEmbed = new MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('| AutoRol Asignado')
                    .setDescription(`🚨 ➜ Se te ha asignado el rol <@&${role.id}>.`);
                
                await interaction.reply({ embeds: [assignRoleEmbed], ephemeral: true });
                await interaction.member.roles.add(role);
            }

            const options = interaction.message.options;

            const updatedSelectMenu = new MessageSelectMenu()
                .setCustomId('autorole_select')
                .setPlaceholder('🌈 ➜ Selecciona tus notificaciones')
                .setOptions(options);

            const updatedRow = new MessageActionRow().addComponents(updatedSelectMenu);

            await interaction.message.edit({ components: [updatedRow] });
        } else {
            const roleNotFoundEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**SEND PANEL** | Rol No Encontrado')
                .setDescription('➜ Hubo un problema al buscar un rol (no encontrado o eliminado). __Contacta con el Equipo Administrativo del Servidor.__');
            await interaction.reply({ embeds: [roleNotFoundEmbed], ephemeral: true });
        }
    }
});

