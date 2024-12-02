const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const moment = require('moment');
const SuggestChannelModel = require('../../database/models/SuggestChannelModel');
const AllowChannelModel = require('../../database/models/AllowChannelModel');
const ModLogModel = require('../../database/models/ModLogModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('debug')
    .setDescription('🔧 Comando de depuración para servidores'),
  async run(client, interaction) {

    const allowedUserIds = ['828991790324514887', '944622203792658485'];
    const isAllowedUser = allowedUserIds.includes(interaction.user.id);

    if (!isAllowedUser && !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      const noPermissionEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('**PERMISO DENEGADO** | Permisos Insuficientes')
        .setDescription('➜ Debes tener permisos de `ADMINISTRATOR` para ejecutar este comando.');

      return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: false });
    }

    const logChannelId = '1290427145234944071';
    const logChannel = client.channels.cache.get(logChannelId);

    if (!logChannel || !logChannel.isText()) {
      return interaction.reply(':warning: ➜ No se encontró el canal de registro en el servidor destino. __Contacta a un desarrollador__.');
    }

    const inviteChannel = interaction.guild.systemChannel || interaction.guild.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(interaction.guild.me).has(Permissions.FLAGS.CREATE_INSTANT_INVITE));

    if (!inviteChannel) {
      return interaction.reply(':warning: ➜ No se encontró un canal de texto para crear la invitación. __Contacta a un desarrollador__.');
    }

    try {
      const invite = await inviteChannel.createInvite({ unique: true, maxUses: 1, maxAge: 0 });

      const suggestChannelData = await SuggestChannelModel.findOne({ guildId: interaction.guild.id });
      const allowChannelData = await AllowChannelModel.findOne({ serverId: interaction.guild.id });
      const modLogData = await ModLogModel.findOne({ guildId: interaction.guild.id });

      const modLogChannel = modLogData ? interaction.guild.channels.cache.get(modLogData.channelId) : null;

      const server = interaction.guild;
      const owner = await server.fetchOwner();
      const ownerTag = owner ? `<@${owner.user.id}>` : 'No disponible';

      const serverInfoEmbed = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle('Debug - Información del Servidor')
        .addFields(
          { name: 'Invitación', value: `➥ ${invite.url}` },
          { name: 'Nombre del Servidor', value: `➥ __${interaction.guild.name}__` },
          { name: 'ID del Servidor', value: `➥ __${interaction.guild.id}__` },
          { name: 'Total de Miembros', value: `➥ __${interaction.guild.memberCount}__` },
          { name: 'Owner', value: `➥ ${ownerTag}` },
          { name: 'Creado Hace', value: `➥ ${moment(interaction.guild.createdTimestamp).format('LT')} ${moment(interaction.guild.createdTimestamp).format('LL')} (**${moment(interaction.guild.createdTimestamp).fromNow()}**)` },
          { name: 'Canal de Sugerencias Configurado', value: `➥ ${suggestChannelData ? `<#${suggestChannelData.channelId}>` : '__No configurado__'}` },
          { name: 'Canal Permitido para /suggest', value: `➥ ${allowChannelData ? `<#${allowChannelData.allowedChannelId}>` : '__No configurado__'}` },
          { name: 'Canal de Mod Logs Configurado', value: `➥ ${modLogChannel ? `<#${modLogChannel.id}>` : '__No configurado__'}` }
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setTimestamp();

      logChannel.send({ embeds: [serverInfoEmbed] });

      if (isAllowedUser) {
        interaction.reply({ embeds: [serverInfoEmbed], ephemeral: true });
      } else {
        const logEmbed = new MessageEmbed()
          .setColor("RANDOM")
          .setTitle('Debug - Registro de Servidor')
          .setDescription(`Se generó la información del servidor.`)
          .addFields(
            { name: 'Nombre del Servidor', value: `➥ __${interaction.guild.name}__` },
            { name: 'ID del Servidor', value: `➥ __${interaction.guild.id}__` },
            { name: 'Canal de Sugerencias Configurado', value: `➥ ${suggestChannelData ? `<#${suggestChannelData.channelId}>` : '__No configurado__'}` },
            { name: 'Canal Permitido para /suggest', value: `➥ ${allowChannelData ? `<#${allowChannelData.allowedChannelId}>` : '__No configurado__'}` },
            { name: 'Canal de Mod Logs Configurado', value: `➥ ${modLogChannel ? `<#${modLogChannel.id}>` : '__No configurado__'}` }
          )
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setTimestamp();

        interaction.reply({ embeds: [logEmbed], ephemeral: true });
      }
    } catch (error) {
      console.error('[DEBUG SLASH ERROR LOG] >> Error al ejecutar el comando:', error);
      interaction.reply(':warning: ➜ Se produjo un error al generar la información. __Contacta con un desarrollador si el error persiste.__');
    }
  },
};
