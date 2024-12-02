const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, TextChannel, Collection } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const SuggestChannel = require('../../database/models/SuggestChannelModel');
const Suggestion = require('../../database/models/SuggestModel');
const AllowChannelModel = require('../../database/models/AllowChannelModel');
const PremiumGuild = require('../../database/models/GuildPremiumModel');
const CustomReactions = require('../../database/models/CustomReactionsModel');
const cooldowns = new Collection();

async function addReactions(message, guildId) {
  try {
    const customReactions = await CustomReactions.findOne({ guildId, enabled: true });
    
    if (customReactions) {
      await message.react(customReactions.upvoteEmoji);
      await message.react(customReactions.downvoteEmoji);
    } else {
      await message.react('YOUR_EMOJI_ID');
      await message.react('YOUR_EMOJI_ID');
    }
  } catch (error) {
    console.error('[SUGGEST REACTIONS ERROR] >>', error);
    await message.react('YOUR_EMOJI_ID');
    await message.react('YOUR_EMOJI_ID');
  }
}

async function verificarPremium(guildId) {
  try {
    const premiumGuild = await PremiumGuild.findOne({ guildId }).exec();
    return premiumGuild !== null;
  } catch (error) {
    return false;
  }
}

async function generateUniqueCode() {
  let uniqueCode;
  const codeLength = 4;
  let existingSuggestion;

  do {
    uniqueCode = Math.floor(1000 + Math.random() * 9000).toString();
    existingSuggestion = await Suggestion.findOne({ id: uniqueCode }).exec();
  } while (existingSuggestion);

  return uniqueCode;
}

async function obtenerPalabrasProhibidas() {
  const filePath = path.join(__dirname, 'palabras_prohibidas.txt');
  const contenido = await fs.readFile(filePath, 'utf-8');
  return contenido.split('\n').map(palabra => palabra.trim().toLowerCase());
}

function contienePalabraInapropiada(suggestion, palabrasInapropiadas) {
  const palabrasEnSugerencia = suggestion.split(/\s+/);
  return palabrasEnSugerencia.some(palabra => palabrasInapropiadas.includes(palabra.toLowerCase()));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('💡 Enviar una sugerencia al servidor')
    .addStringOption(option =>
      option.setName('sugerencia')
        .setDescription('📫 La sugerencia que deseas hacer.')
        .setRequired(true)),

  async run(client, interaction) {
    const suggestion = interaction.options.getString('sugerencia');
    const user = interaction.user;
    const guildId = interaction.guildId;

    try {
      const palabrasInapropiadas = await obtenerPalabrasProhibidas();

      if (contienePalabraInapropiada(suggestion, palabrasInapropiadas)) {
        const embed = new MessageEmbed()
          .setColor('RED')
          .setTitle('**SUGERENCIAS** | Contenido Inapropiado')
          .setDescription('➜ Tu sugerencia contiene contenido inapropiado. Por favor, sea respetuoso. https://github.com/TryReturn ');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (!suggestion) {
        const embed = new MessageEmbed()
          .setColor('RED')
          .setTitle('**SUGERENCIAS** | Argumentos Faltantes')
          .setDescription('➜ Uso válido: `/suggest [sugerencia]`. https://github.com/TryReturn ');

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const allowChannelData = await AllowChannelModel.findOne({ serverId: guildId });

      if (allowChannelData && allowChannelData.allowedChannelId !== interaction.channelId) {
        const notAllowedChannelEmbed = new MessageEmbed()
          .setColor('RED')
          .setTitle('**SUGERENCIAS** | Canal no Permitido')
          .setDescription('➜ Este canal no está permitido para enviar sugerencias. Por favor, busqué el canal de comandos publicos.');

        return interaction.reply({ embeds: [notAllowedChannelEmbed], ephemeral: true });
      }

      const suggestChannelData = await SuggestChannel.findOne({ guildId }).exec();

      if (!suggestChannelData) {
        const notConfiguredEmbed = new MessageEmbed()
          .setColor('ORANGE')
          .setTitle('**SUGERENCIAS** | Canal no Configurado')
          .setDescription('➜ El canal de sugerencias no está configurado en este servidor. Por favor, contacta a un administrador para configurarlo.');

        return interaction.reply({ embeds: [notConfiguredEmbed], ephemeral: true });
      }

      const suggestionChannel = interaction.guild.channels.cache.get(suggestChannelData.channelId);

      if (suggestionChannel instanceof TextChannel) {
        const premium = await verificarPremium(guildId);
        const maxSuggestionLength = premium ? 1000 : 500;
        const cooldownTime = 30000;

        if (suggestion.length >= maxSuggestionLength) {
          const lengthErrorEmbed = new MessageEmbed()
            .setColor('RED')
            .setTitle('**SUGERENCIAS** | Longitud Excedida')
            .setDescription(`➜ La longitud máxima de la sugerencia es de **${maxSuggestionLength} caracteres**.`);

          return interaction.reply({ embeds: [lengthErrorEmbed], ephemeral: true });
        }

        const cooldownKey = `${guildId}-${user.id}`;
        const currentTimestamp = Date.now();
        const cooldownTimeUser = cooldowns.get(cooldownKey);

        if (cooldownTimeUser && currentTimestamp < cooldownTimeUser) {
          const remainingTime = Math.ceil((cooldownTimeUser - currentTimestamp) / 1000);
          const cooldownErrorEmbed = new MessageEmbed()
            .setColor('ORANGE')
            .setTitle('**SUGERENCIAS** | Cooldown Activado')
            .setDescription(`➜ Por favor, espera **${remainingTime} segundos** antes de enviar otra sugerencia.`);

          return interaction.reply({ embeds: [cooldownErrorEmbed], ephemeral: true });
        }

        cooldowns.set(cooldownKey, currentTimestamp + cooldownTime);

        if (premium) {
          if (suggestion.match(/(https?:\/\/[^\s]+)/g)) {
            const linkErrorEmbed = new MessageEmbed()
              .setColor('RED')
              .setTitle('**SUGERENCIAS** | Contenido No Permitido')
              .setDescription('➜ Lo siento, pero no puedes incluir enlaces en tu sugerencia en este momento. Por favor, elimina cualquier enlace y vuelve a enviar tu sugerencia.');

            return interaction.reply({
              embeds: [linkErrorEmbed], ephemeral: true
            });
          }

          if (suggestion.match(/\b(\w+\.(jpg|jpeg|gif|png|bmp|svg|webp))\b/g)) {
            const fileErrorEmbed = new MessageEmbed()
              .setColor('RED')
              .setTitle('**SUGERENCIAS** | Contenido No Permitido')
              .setDescription('➜ Lo siento, pero no puedes adjuntar archivos a tu sugerencia en este momento. Por favor, envía tu sugerencia sin archivos adjuntos.');

            return interaction.reply({ embeds: [fileErrorEmbed], ephemeral: true });
          }
        }

        let footerText = 'https://github.com/TryReturn';
        let footerIcon = '';

        const isPremium = await verificarPremium(interaction.guildId);
        if (isPremium) {
          footerText = interaction.guild.name;
          footerIcon = interaction.guild.iconURL();
        }

        const suggestionID = await generateUniqueCode();

        const suggestEmbed = new MessageEmbed()
          .setColor('#e6db13')
          .setTitle('| Nueva Sugerencia')
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setDescription(`* **Identificador**: ${suggestionID}\n* **Miembro**: ${user}\n* **Sugerencia**: ${suggestion}`)
          .setFooter({ text: footerText, iconURL: footerIcon })
          .setTimestamp();

        suggestionChannel.send({ embeds: [suggestEmbed] })
          .then(async (suggestionMessage) => {
            await addReactions(suggestionMessage, interaction.guildId);

            const successEmbed = new MessageEmbed()
              .setColor('GREEN')
              .setTitle('**SUGERENCIAS** | Sugerencia Registrada')
              .setDescription(`➜ Tu sugerencia se ha registrado en <#${suggestChannelData.channelId}>.\n**¡__Mantente al pendiente de tu sugerencia__! (${suggestionID})** https://github.com/TryReturn `)

            interaction.reply({ embeds: [successEmbed] });

            const newSuggestion = new Suggestion({
              id: suggestionID,
              estado: 'Voting',
              contenido: suggestion,
              autor: user.tag,
              guildId: guildId,
              mensajeId: suggestionMessage.id,
              canalId: suggestionChannel.id
            });

            try {
              await newSuggestion.save();
            } catch (error) {
              console.error('[CONSOLE SUGGEST SLASH ERROR] >> Error al almacenar la sugerencia en la base de datos:', error);
            }
          })
          .catch((error) => {
            console.error('[CONSOLE SUGGEST SLASH ERROR] >> Error al enviar la sugerencia:', error);
            const errorEmbed = new MessageEmbed()
              .setColor('RED')
              .setTitle('**SUGERENCIAS** | Error  al Enviar Sugerencia')
              .setDescription('➜ Ocurrió un error al enviar la sugerencia. Por favor, inténtalo de nuevo.');

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          });
      } else {
        const channelErrorEmbed = new MessageEmbed()
          .setColor('ORANGE')
          .setTitle('**SUGERENCIAS** | Error de Canal')
          .setDescription('➜ No se encontró el canal de sugerencias. Por favor, contacta a un **administrador** del servidor.');

        return interaction.reply({ embeds: [channelErrorEmbed], ephemeral: true });
      }
    } catch (error) {
      console.error('[CONSOLE SUGGEST SLASH ERROR] >> Error al obtener la configuración del canal de sugerencias:', error);
      const errorEmbed = new MessageEmbed()
        .setColor('RED')
        .setTitle('**SUGERENCIAS** | Error de Procesamiento')
        .setDescription('➜ Error al procesar la sugerencia. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
}
