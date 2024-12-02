const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('docs')
    .setDescription('📕 Muestra documentos de aprendizaje públicos'),

  async run(client, interaction) {
    const selectMenu = new MessageSelectMenu()
      .setCustomId('menu-resources')
      .setPlaceholder('🧷・ Haz clic y selecciona una categoría.');

    selectMenu.addOptions([
      {
        label: '🔏 Hacking Ético',
        value: 'hacking-ethical',
        description: 'Enlaces relacionados con hacking ético.',
      },
      {
        label: '💻 Programación',
        value: 'programming',
        description: 'Enlaces relacionados con programación.',
      },
      {
        label: '📡 Redes Neuronales',
        value: 'neural-networks',
        description: 'Enlaces relacionados con redes neuronales.',
      },
      {
        label: '📬 Ingeniería',
        value: 'engineering',
        description: 'Enlaces relacionados con ingeniería.',
      },
      {
        label: '🚀 Próximamente',
        value: 'coming',
        description: 'Más enlaces próximamente.',
      },
    ]);

    const row = new MessageActionRow().addComponents(selectMenu);

    const initialEmbed = new MessageEmbed()
      .setTitle('📚・➥ Enlaces de Aprendizaje')
      .setColor('RANDOM')
      .setDescription('Selecciona una categoría del menú a continuación para ver los enlaces de aprendizaje que ofrecemos.');

    await interaction.reply({ embeds: [initialEmbed], components: [row] });

    const filter = (interaction) =>
      interaction.isSelectMenu() && interaction.customId === 'menu-resources';

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 180000, // 3 minutos (180000 ms)
    });

    collector.on('collect', async (interaction) => {
      const selectedOption = interaction.values[0];

      if (selectedOption === 'hacking-ethical') {
        const hackingEthicalEmbed = new MessageEmbed()
          .setTitle('🔒 Hacking Ético')
          .setColor('RANDOM')
          .setDescription('Enlaces relacionados con hacking ético:')
          .addFields(
            { name: 'Hacking desde Cero PDF (196 páginas)', value: '[Haz clic aquí](https://www.pdfdrive.com/hacking-from-scratch-e19046560.html)' },
            { name: 'Hacking Ético por Carlos Tori - PDF Drive', value: '[Haz clic aquí](https://www.pdfdrive.com/ethical-hacking-e187570783.html)' }
          )
          .setFooter({ text: 'Derechos © Estos documentos no pertenecen a Folk Studios' });

        interaction.reply({ embeds: [hackingEthicalEmbed], ephemeral: true });
      } else if (selectedOption === 'programming') {
        const programmingEmbed = new MessageEmbed()
          .setTitle('💻 Programación')
          .setColor('RANDOM')
          .setDescription('Enlaces relacionados con programación:')
          .addFields(
            { name: 'JS - Archivo de Drive', value: '[Haz clic aquí](https://drive.google.com/file/d/16UNqmaBu0GACT4YpIvcTHE9tRqqo7ll1/view?usp=drivesdk)' },
            { name: 'PYTHON - Archivo de Drive', value: '[Haz clic aquí](https://drive.google.com/file/d/1yq6u-4atoIqlSpQsttqRUBqqBHUaXISg/view?usp=drivesdk)' }
          )
          .setFooter({ text: 'Derechos © Estos documentos no pertenecen a Folk Studios' });

        interaction.reply({ embeds: [programmingEmbed], ephemeral: true });
      } else if (selectedOption === 'neural-networks') {
        const neuralNetworksEmbed = new MessageEmbed()
          .setTitle('🤖 Redes Neuronales en Python')
          .setColor('RANDOM')
          .setDescription('Enlaces relacionados con redes neuronales en Python:')
          .addFields(
            { name: 'Blog de Tecnología', value: '[Haz clic aquí](https://blogs.imf-formacion.com/blog/tecnologia/crear-red-neuronal-en-phyton-202009/)' }
          )
          .setFooter({ text: 'Derechos © Estos documentos no pertenecen a Folk Studios' });

        interaction.reply({ embeds: [neuralNetworksEmbed], ephemeral: true });
      } else if (selectedOption === 'engineering') {
        const engineeringEmbed = new MessageEmbed()
          .setTitle('🔧 Ingeniería')
          .setColor('RANDOM')
          .setDescription('Enlaces relacionados con ingeniería:')
          .addFields(
            { name: 'Libros Gratis', value: '[Haz clic aquí](https://infolibros.org/libros-pdf-gratis/ingenieria/)' }
          )
          .setFooter({ text: 'Derechos © Estos documentos no pertenecen a Folk Studios' });

        interaction.reply({ embeds: [engineeringEmbed], ephemeral: true });
      } else if (selectedOption === 'coming') {
        const comingEmbed = new MessageEmbed()
          .setTitle('🚀 Próximamente')
          .setColor('RANDOM')
          .setDescription('Estamos trabajando en más enlaces. Si tienes alguna sugerencia, usa `/suggest`.');

        interaction.reply({ embeds: [comingEmbed], ephemeral: true });
      }
    });

    collector.on('end', (collected) => {
    });
  },
};
