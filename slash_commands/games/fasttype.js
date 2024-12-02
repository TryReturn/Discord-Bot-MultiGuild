const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fasttype')
    .setDescription('👀 Adivina la palabra lo más rápido posible para ganar'),

  async run(client, interaction) {
    const words = [
        'rápido', 'discord', 'javascript', 'programación', 'servidor', 'teclado', 'pantalla', 
        'código', 'algoritmo', 'computadora', 'internet', 'variable', 'función', 'arreglo', 
        'sintaxis', 'compilador', 'optimización', 'framework', 'base de datos', 'navegador', 
        'depuración', 'interfaz', 'desarrollador', 'hardware', 'software', 'módulo', 
        'constructor', 'inteligencia artificial', 'circuito', 'sistema operativo', 'memoria',
        'procesador', 'red neuronal', 'servidor web', 'dominio', 'hosting', 'rendimiento', 
        'virtualización', 'nube', 'sincronización', 'asíncrono', 'biblioteca', 'dependencia', 
        'protocolo', 'encriptación', 'cifrado', 'token', 'seguridad', 'conexión', 'firewall', 
        'criptomoneda', 'blockchain', 'contrato inteligente', 'parámetro', 'recursividad', 
        'heurística', 'solución', 'optimización', 'pantalla', 'documentación', 'renderizado', 
        'componente', 'caché', 'modificación', 'implementación', 'despliegue', 'infraestructura', 
        'proceso', 'controlador', 'autenticación', 'api', 'servidores', 'datos', 'clases', 
        'instancias', 'diseño', 'modelo', 'vista', 'controlador', 'patrón', 'dom', 'html', 
        'css', 'python', 'nodejs', 'react', 'angular', 'vue', 'bootstrap', 'linux', 
        'windows', 'macos', 'ubuntu', 'debian', 'centos', 'fedora', 'virtualización', 'json', 
        'xml', 'yaml', 'docker', 'kubernetes', 'microservicios', 'cloud computing', 'azure', 
        'aws', 'google cloud', 'terraform', 'devops', 'automatización', 'ciberseguridad'
      ];
  
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const channel = interaction.channel;

    const fastTypeEmbed = new MessageEmbed()
      .setColor('#FFD700')
      .setTitle('⌛ FastType Challenge!')
      .setDescription(`¡Escribe la palabra lo más rápido posible!\n\n**Palabra:** \`${randomWord}\``)
      .setFooter({ text: 'Sé el primero en escribir la palabra correctamente para ganar!' });

    await interaction.reply({ embeds: [fastTypeEmbed] });

    const filter = message => message.content.toLowerCase() === randomWord.toLowerCase() && !message.author.bot;

    channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] })
      .then(collected => {
        const winner = collected.first();
        const winnerEmbed = new MessageEmbed()
          .setColor('GREEN')
          .setTitle('🎉 ¡Tenemos un ganador!')
          .setDescription(`El usuario **${winner.author.tag}** fue el primero en escribir la palabra correctamente.\n\n**Palabra:** \`${randomWord}\``)
          .setFooter({ text: '¡Felicidades!' });

        channel.send({ embeds: [winnerEmbed] });
      })
      .catch(() => {
        const noWinnerEmbed = new MessageEmbed()
          .setColor('RED')
          .setTitle('⏳ ¡Tiempo agotado!')
          .setDescription(`Nadie escribió la palabra a tiempo. La palabra correcta era \`${randomWord}\`.`);

        channel.send({ embeds: [noWinnerEmbed] });
      });
  },
};
