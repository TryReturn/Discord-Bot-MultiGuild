const client = require("../../index.js");
const config = require("../../config.json");
const { MessageEmbed } = require('discord.js');
const ms = require("ms");
const chalk = require('chalk');

let savedActivity;
let savedStatus;
let activityIndex = 0;

client.once('ready', async () => {
  console.log(chalk.green('[READY]'), chalk.white(`${client.user.tag} ¡Está listo capoooo!`));

  const up = ms(ms(Math.round(process.uptime() - (client.uptime / 1000)) + ' seconds'));
  const status = '/help for commands';

  console.log(
    chalk.blue(chalk.bold('NODEJS')),
    chalk.white('>>'), `Tu IDE tardó ${chalk.magenta(up)} en cargar y conectarse al bot.`
  );

  await client.user.fetch();

  savedActivity = client.user.presence.activities[0];
  savedStatus = client.user.presence.status;

  // ##                                 Sugerencias de Presencia.
  // let status2Count = client.users.cache.size;
  // let status3Count = client.guilds.cache.size;
  // LISTENING, PLAYING and STREAMING

  let status2Count = "rebrand.ly/folkdiscord";
  let status3Count = "@ConsterSolutions";
  let status4Count = "github.com/TryReturn";

  const activities = [
    { name: `${status}`, type: "WATCHING" },
    { name: `${status3Count}`, type: "PLAYING" },
    { name: `${status2Count}`, type: "PLAYING" },
    { name: `${status4Count}`, type: "STREAMING"}
  ];

  //                              HABILITA ESTA OPCIÓN SI USARAS PRESENCIA DE SERVIDORES Y USUARIOS
//setInterval(() => {
    //status2Count = client.users.cache.size;
    //status3Count = client.guilds.cache.size;

   // client.user.setActivity(activities[activityIndex]);
  //  activityIndex = (activityIndex + 1) % activities.length;
//  }, 60000);
  
  const channelId = 'YOUR CHANNEL ID';
  const channel = client.channels.cache.get(channelId);

  if (channel) {
    channel.send("Dale una estrella a mis proyectos!😋🏹\n> https://github.com/TryReturn");

    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Estoy en Línea!')
      .setDescription(`El bot está en línea y listo para usarse`)
      .setThumbnail('https://cdn.discordapp.com/icons/1210981966288126022/f9de2cb986b582a008307206e85cd430.png?size=2048')
      .setFooter({ text: `${status3Count} servidores y ${status2Count} miembros.` })
      .setTimestamp();

    channel.send({ embeds: [embed] });
  } else {
    console.error(`[READY ERROR LOG] >> No encuentro el canal con la ID: ${channelId}.`);
  }
});

client.on('reconnecting', () => {
  console.log(chalk.blue(chalk.bold('[READY]')), chalk.white(client.user.tag), 'está reconectando.');
});

client.on('resume', (replayed) => {
  console.log(chalk.blue('[READY]'), chalk.white(client.user.tag), 'se ha reconectado. Se reprodujeron', chalk.green(replayed), 'eventos.');

  client.user.setPresence({
    activities: [savedActivity],
    status: savedStatus,
  });
});
