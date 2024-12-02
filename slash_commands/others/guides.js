const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guides')
    .setDescription('📕 Pantallas de aprendizaje para algunas dependencias'),

  async run(client, interaction) {
    const selectMenu = new MessageSelectMenu()
      .setCustomId('menu-guides')
      .setPlaceholder('📚・ Haz clic y selecciona una categoría.');

    selectMenu.addOptions([
      {
        label: '🍃 MongoDB',
        value: 'mongodb',
        description: 'Guías y recursos para MongoDB.',
      },
      {
        label: '🤖 Manejadores',
        value: 'handlers',
        description: 'Guías y recursos para los manejadores de Discord.js.',
      },
      {
        label: '💻 Fragmentos de código de JavaScript',
        value: 'js-code',
        description: 'Fragmentos de código útiles de JavaScript de internet.',
      },
      {
        label: '🚀 Próximamente',
        value: 'coming',
        description: 'Más guías próximamente.',
      },
    ]);

    const row = new MessageActionRow().addComponents(selectMenu);

    const initialEmbed = new MessageEmbed()
      .setTitle('📚・➥ Guías de aprendizaje')
      .setColor('RANDOM')
      .setDescription('Selecciona una categoría del menú a continuación para ver las guías de aprendizaje y recursos.');

    await interaction.reply({ embeds: [initialEmbed], components: [row] });

    const filter = (interaction) =>
      interaction.isSelectMenu() && interaction.customId === 'menu-guides';

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 180000, // 3 minutos (180000 ms)
    });

    collector.on('collect', async (interaction) => {
      const selectedOption = interaction.values[0];

      if (selectedOption === 'mongodb') {
        const mongodbEmbed = new MessageEmbed()
          .setTitle('🍃 Guías de MongoDB')
          .setColor('RANDOM')
          .setDescription('Guías y recursos para MongoDB:')
          .addFields(
            { name: 'Documentación oficial de MongoDB', value: '[Enlace oficial](https://docs.mongodb.com/)' },
            { name: 'Instalación de MongoDB', value: '[Enlace oficial](https://docs.mongodb.com/manual/administration/install-community/)' },
            { name: 'Estrategias de indexación', value: '[Enlace oficial](https://docs.mongodb.com/manual/indexes/)' },
            { name: 'Consultas básicas en MongoDB', value: '[Enlace oficial](https://docs.mongodb.com/manual/crud/)' },
            { name: 'Conceptos básicos del marco de agregación', value: '[Enlace oficial](https://docs.mongodb.com/manual/aggregation/)' },
            { name: 'Modelado de datos en MongoDB', value: '[Enlace oficial](https://docs.mongodb.com/manual/core/data-modeling-introduction/)' },
            { name: 'Cursos de MongoDB University', value: '[Enlace oficial](https://university.mongodb.com/)' },
            { name: 'Guía de inicio rápido de MongoDB Atlas', value: '[Enlace oficial](https://docs.atlas.mongodb.com/getting-started/)' },
            { name: 'Hoja de referencia de comandos de MongoDB Shell', value: '[Enlace oficial](https://www.mongodb.com/developer/quickstart/cheat-sheet/)' }
          )
          .setFooter({ text: 'Derechos © Estos documentos no pertenecen a Folk Studios' });

        interaction.reply({ embeds: [mongodbEmbed], ephemeral: true });
      } else if (selectedOption === 'handlers') {
        const handlersEmbed = new MessageEmbed()
          .setTitle('🤖 Manejadores de Discord.js')
          .setColor('RANDOM')
          .setDescription('Guías y recursos para los manejadores de Discord.js:')
          .addFields(
            { name: 'Documentación del marco Commando', value: '[Enlace oficial](https://discord.js.org/#/docs/commando)' },
            { name: 'Guía para el desarrollo de bots en Discord.js', value: '[Enlace oficial](https://discordjs.guide/)' },
            { name: 'Entendiendo los eventos en Discord.js', value: '[Enlace oficial](https://discordjs.guide/popular-topics/events.html)' },
            { name: 'Creación de un bot de música con Discord.js', value: '[Enlace oficial](https://gabys.ga/music-bot)' },
            { name: 'Creación de un bot de moderación con Discord.js', value: '[Enlace oficial](https://repl.it/@toad22484/Command-Handler?v=1)' },
            { name: 'Configuración de un manejador de comandos en Discord.js v13', value: '[Enlace oficial](https://dev.to/exoteq/setting-up-a-command-handler-in-discord-js-v13-3fma)' },
            { name: 'Tutorial avanzado de bot Discord.js', value: '[Enlace oficial](https://replit.com/talk/learn/Advanced-Discordjs-Bot-Tutorial/49000)' }
          )
          .setFooter({ text: 'Derechos © Estos documentos no pertenecen a Folk Studios' });

        interaction.reply({ embeds: [handlersEmbed], ephemeral: true });
      } else if (selectedOption === 'js-code') {
        const jsCodeEmbed = new MessageEmbed()
          .setTitle('💻 Fragmentos de código de JavaScript')
          .setColor('RANDOM')
          .setDescription('Fragmentos de código útiles de JavaScript de internet:')
          .addFields(
            { name: 'Awesome JavaScript - Una colección de fragmentos esenciales de JS', value: '[Enlace oficial](https://github.com/sorrycc/awesome-javascript#readme)' },
            { name: '30 Segundos de Código - Fragmentos cortos de código de JavaScript para todas tus necesidades de desarrollo', value: '[Enlace oficial](https://www.30secondsofcode.org/)' },
            { name: 'JSFiddle - Editor de JavaScript en línea', value: '[Enlace oficial](https://jsfiddle.net/)' },
            { name: 'Gists de GitHub - Crea instantáneamente', value: '[Enlace oficial](https://gist.github.com/)' },
            { name: 'Algoritmos y estructuras de datos en JavaScript', value: '[Enlace oficial](https://github.com/trekhleb/javascript-algorithms#readme)' }
          )
          .setFooter({ text: 'Derechos © Estos documentos no pertenecen a Folk Studios' });

        interaction.reply({ embeds: [jsCodeEmbed], ephemeral: true });
      } else if (selectedOption === 'coming') {
        const comingEmbed = new MessageEmbed()
          .setTitle('🚀 Próximamente')
          .setColor('RANDOM')
          .setDescription('Estamos trabajando en más guías. Si tienes alguna sugerencia, usa `/suggest`.\nhttps://github.com/TryReturn ');

        interaction.reply({ embeds: [comingEmbed], ephemeral: true });
      }
    });

    collector.on('end', (collected) => {
    });
  },
};
