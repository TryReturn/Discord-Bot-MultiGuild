const { SlashCommandBuilder } = require('@discordjs/builders');
const PremiumGuild = require('../../database/models/GuildPremiumModel');
const { MessageEmbed, TextChannel } = require('discord.js');
const owners = ['828991790324514887', '944622203792658485'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('premium')
    .setDescription('🔨💎 Gestión de servidores premium')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('💎 Marcar un servidor como premium')
        .addStringOption(option =>
          option.setName('guild')
            .setDescription('📬 ID del servidor.')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('expire')
            .setDescription('⏰ Duración del premium (ej. 7d, 1w, etc.).')
            .setRequired(true)),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('💎 Desmarcar un servidor como premium')
        .addStringOption(option =>
          option.setName('guild')
            .setDescription('📬 ID del servidor.')
            .setRequired(true)),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('💎 Listar servidores premium')),

  async run(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (!owners.includes(interaction.user.id)) {
      return interaction.reply({ content: '__**No**__ ➜ :joy_cat: :index_pointing_at_the_viewer:.', ephemeral: false });
    }

    if (subcommand === 'add') {
      const guildId = interaction.options.getString('guild');
      const expire = interaction.options.getString('expire');
      const expireDate = calculateExpireDate(expire);

      try {
        const existingPremiumGuild = await PremiumGuild.findOne({ guildId });

        if (existingPremiumGuild) {
          const premiumAlreadyExistsEmbed = new MessageEmbed()
            .setColor('RED')
            .setTitle('**PREMIUM** | Error de Almacenamiento')
            .setDescription(`➜ El servidor con ID **__${guildId}__** ya está marcado como premium.`);

          return interaction.reply({ embeds: [premiumAlreadyExistsEmbed], ephemeral: true });
        }

        const premiumGuildData = {
          guildId,
          addedBy: {
            id: interaction.user.id,
            tag: interaction.user.tag,
          },
          expireDate,
        };

        const premiumGuild = new PremiumGuild(premiumGuildData);
        await premiumGuild.save();

        const successEmbed = new MessageEmbed()
          .setColor('#32CD32')
          .setTitle('**PREMIUM** | Añadido')
          .setDescription(`➜ Servidor **__${guildId}__** marcado como premium con éxito hasta <t:${Math.round(expireDate.getTime() / 1000)}:F>.`)
          .setThumbnail(client.user.displayAvatarURL());

        interaction.reply({ embeds: [successEmbed], ephemeral: false });

        sendPremiumInfoToChannel(client, interaction, guildId, 'Agregado', expireDate);
      } catch (error) {
        console.error('[PREMIUM SLASH ERROR LOG] >> Error al marcar el servidor como premium:', error);

        const premiumAddErrorEmbed = new MessageEmbed()
          .setColor('RED')
          .setTitle('**PREMIUM** | Error de Almacenamiento')
          .setDescription('➜ Hubo un error al agregar el servidor como premium.');

        interaction.reply({ embeds: [premiumAddErrorEmbed], ephemeral: true });
      }
    } else if (subcommand === 'remove') {
      const guildId = interaction.options.getString('guild');

      try {
        const premiumGuild = await PremiumGuild.findOneAndRemove({ guildId });

        if (premiumGuild) {
          sendPremiumInfoToChannel(client, interaction, guildId, 'Eliminado');

          const removeSuccessEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setTitle('**PREMIUM** | Eliminado')
            .setDescription(`➜ El servidor **__${guildId}__** ha sido removido de la lista premium.`)
            .setThumbnail(client.user.displayAvatarURL());

          interaction.reply({ embeds: [removeSuccessEmbed], ephemeral: false });
        } else {
          const noPremiumFoundEmbed = new MessageEmbed()
            .setColor('RED')
            .setTitle('**PREMIUM** | Error de Busqueda')
            .setDescription('➜ No se encontró un servidor premium con la ID proporcionada.');

          interaction.reply({ embeds: [noPremiumFoundEmbed], ephemeral: true });
        }
      } catch (error) {
        console.error('[PREMIUM SLASH ERROR LOG] >> Error al eliminar el servidor como premium:', error);

        const removeErrorEmbed = new MessageEmbed()
          .setColor('RED')
          .setTitle('**PREMIUM** | Error de Almacenamiento')
          .setDescription('➜ Hubo un error al eliminar el servidor como premium.');

        interaction.reply({ embeds: [removeErrorEmbed], ephemeral: true });
      }
    }
  },
};

// Función para calcular la fecha de expiración
function calculateExpireDate(duration) {
  const durationRegex = /(\d+)\s*([dwhms])/g;
  let match;
  let totalMilliseconds = 0;

  while ((match = durationRegex.exec(duration)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd':
        totalMilliseconds += value * 24 * 60 * 60 * 1000;
        break;
      case 'w':
        totalMilliseconds += value * 7 * 24 * 60 * 60 * 1000;
        break;
      case 'h':
        totalMilliseconds += value * 60 * 60 * 1000;
        break;
      case 'm':
        totalMilliseconds += value * 60 * 1000;
        break;
      case 's':
        totalMilliseconds += value * 1000;
        break;
    }
  }

  const currentDate = new Date();
  return new Date(currentDate.getTime() + totalMilliseconds);
}

function sendPremiumInfoToChannel(client, interaction, guildId, action, expireDate = null) {
  const logChannels = {
    'Agregado': '',   // Canal para logs de añadir premium
    'Eliminado': '',  // Canal para logs de eliminación premium
    'Expirado': '',   // Canal para logs de expiración premium
  };

  const logsChannelId = logChannels[action];
  const logsChannel = client.channels.cache.get(logsChannelId) || interaction.guild.channels.cache.get(logsChannelId);

  if (!logsChannel || !(logsChannel instanceof TextChannel)) return;

  const logEmbed = new MessageEmbed()
    .setColor(action === 'Agregado' ? 'GREEN' : 'RED')
    .setTitle(`Premium ${action}`)
    .setDescription(`Servidor: ${guildId}\nAcción realizada por: ${interaction.user}`)
    .setThumbnail(client.user.displayAvatarURL())
    .addFields({ name: 'Estado', value: action });

  if (action === 'Agregado' && expireDate) {
    logEmbed.addFields({ name: 'Fecha de Expiración', value: `<t:${Math.round(expireDate.getTime() / 1000)}:F>` });
  }

  logsChannel.send({ embeds: [logEmbed] });
}

async function handlePremiumExpiration(client) {
  const now = new Date();

  try {
    const expiredGuilds = await PremiumGuild.find({ expireDate: { $lte: now } });

    for (const guild of expiredGuilds) {
      await PremiumGuild.findByIdAndRemove(guild._id);

      const expirationEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('**PREMIUM** | Expirado')
        .setDescription(`➜ El servidor **__${guild.guildId}__** ha perdido el estado premium por expiración.`)
        .setThumbnail(client.user.displayAvatarURL());

      const guildOwner = await client.guilds.fetch(guild.guildId).then(g => g.ownerId).catch(() => null);

      if (guildOwner) {
        client.users.cache.get(guildOwner).send({ embeds: [expirationEmbed] }).catch(() => null);
      }

      sendPremiumInfoToChannel(client, { user: { id: guildOwner || 'unknown', tag: 'unknown' } }, guild.guildId, 'Expirado');
    }
  } catch (error) {
    console.error('[PREMIUM SLASH ERROR] >> Error al manejar expiración de servidores premium:', error);
  }
}

setInterval(() => handlePremiumExpiration(client), 60 * 60 * 1000); // 1 hora
