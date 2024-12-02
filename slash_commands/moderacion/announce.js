const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('📢 Haz un anuncio en el servidor')
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('📢 Canal donde se enviará el anuncio.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('titulo')
        .setDescription('📝 Título del anuncio.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('mensaje')
        .setDescription('💬 Mensaje del anuncio.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('imagen')
        .setDescription('📂 URL de la imagen a usar (opcional).')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('links')
        .setDescription('🔗 Enlaces relacionados (separados por comas).')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('tag')
        .setDescription('🔔 Mención (everyone, here).')
        .addChoices(
          { name: 'everyone', value: 'everyone' },
          { name: 'here', value: 'here' }
        )
        .setRequired(false)
    )
    .addRoleOption(option =>
      option.setName('rol')
        .setDescription('🔔 Rol específico que deseas mencionar.')
        .setRequired(false)
    ),

  async run(client, interaction) {

    if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      const noPermissionEmbed = new MessageEmbed()
          .setColor('RED')
          .setTitle('**ANNOUNCE** | Permisos Insuficientes')
          .setDescription('➜ Debes tener permisos de `ADMINISTRATOR` para ejecutar este comando.');
      return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
    }

    if (!interaction.guild.members.me.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
      const botSinPermisoEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle('**ANNOUNCE** | Permiso Denegado')
          .setDescription('➜ El bot no tiene permisos para gestionar el servidor.');
      return interaction.reply({ embeds: [botSinPermisoEmbed], ephemeral: true });
    }

    const titulo = interaction.options.getString('titulo');
    const mensaje = interaction.options.getString('mensaje');
    const imagen = interaction.options.getString('imagen');
    const links = interaction.options.getString('links');
    const tag = interaction.options.getString('tag');
    const rol = interaction.options.getRole('rol');
    const canal = interaction.options.getChannel('canal');

    if (!canal || !canal.isText()) {
      return interaction.reply({
        content: 'El canal seleccionado no es un canal de texto.',
        ephemeral: true,
      });
    }

    const anuncioEmbed = new MessageEmbed()
      .setColor('#e6db13')
      .setTitle(`📍 | ${titulo}`)
      .setDescription(mensaje)
      .setFooter({ text: `Anunciado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    if (imagen) {
      anuncioEmbed.setImage(imagen);
    }

    if (links) {
      const linksArray = links.split(',').map(link => link.trim());
      const formattedLinks = linksArray.map(link => `• ${link}`).join('\n');
      anuncioEmbed.addFields({ name: '🔗 Link(s):', value: formattedLinks });
    }

    let mensajeFinal = { embeds: [anuncioEmbed] };

    if (tag) {
      mensajeFinal.content = `@${tag}`;
    } else if (rol) {
      mensajeFinal.content = `${rol}`;
    }

    canal.send(mensajeFinal);

    interaction.reply({
      content: `El anuncio se ha enviado correctamente en ${canal}.`,
      ephemeral: true,
    });
  },
};
