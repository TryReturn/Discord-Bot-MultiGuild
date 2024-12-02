const client = require('../../index.js');
const config = require('../../config.json');
const { MessageEmbed, WebhookClient } = require('discord.js');
const User = require('../../database/models/BlacklistModel');

const webhookURL = 'YOUR WEBHOOK';
const errorWebhook = new WebhookClient({ url: webhookURL });

const guildAddChannelId = 'YOUR_CHANNEL';
const guildDeleteChannelId = 'YOUR_CHANNEL';

async function isBanned(userId) {
    try {
        const user = await User.findOne({ userId: userId });
        return user && user.isBanned;
    } catch (error) {
        console.error('Error al verificar si el usuario está en la lista negra:', error);
        throw new Error('Error al verificar la lista negra del usuario');
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;

    try {
        const isBannedUser = await isBanned(userId);
        if (isBannedUser) {
            const bannedEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('**BLACKLIST** | Acceso Denegado')
                .setDescription('➜ Estás en la lista negra y no puedes ejecutar comandos del bot. <:FL_PepeCRY:1211081766912262184>');
            return message.reply({ embeds: [bannedEmbed] });
        }

        if (message.content.startsWith(config.prefix)) {
            const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();
            if (cmd.length === 0) return;

            let command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
            if (command) {
                try {
                    command.run(client, message, args, config.prefix);
                } catch (error) {
                    console.error('[COMMAND ERROR] >>', error);
                    const errorEmbed = new MessageEmbed()
                        .setColor('#e74c3c')
                        .setTitle('🚨 | Error Logs')
                        .setDescription(`\`\`\`js\n${error.stack}\n\`\`\``)
                        .setFooter({ text: 'Error Logging | Registros' })
                        .setTimestamp();
                    errorWebhook.send({ embeds: [errorEmbed] });
                }
            }
        }

        const botMention = new RegExp(`^<@!?${client.user.id}>`);
        if (botMention.test(message.content)) {
            const mentionEmbed = new MessageEmbed()
                .setColor('#e67e22')
                .setTitle('¡Hola! ¿Necesitas ayuda?')
                .setDescription('Si necesitas ayuda con , usa lo siguiente:')
                .addFields(
                    { name: '**Preguntas Frecuentes**', value: 'Usa el canal de "**preguntas-faq**" para obtener información sobre nuestro bot.' },
                    { name: '**Comandos de Ayuda**', value: 'Para mirar mis comandos puedes utilizar </help:1211331312808628294> :hugging:' },
                    { name: '**Tickets de Soporte**', value: 'Si necesitas más ayuda, crea un ticket de soporte en el **Discord Oficial**.' },
                    { name: '**Links Oficiales**', value: '[Añádeme Aquí](https://rebrand.ly/folkinvite) **⟺** [Discord de Soporte](https://rebrand.ly/folkdiscord)' }
                )
                .setFooter({ text: 'Folk Bot | Asistencia por Mención', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();
            return message.reply({ embeds: [mentionEmbed] });
        }
    } catch (error) {
        console.error('Error en el evento messageCreate:', error);
    }
});

client.on('guildCreate', async (guild) => {
    const guildAddChannel = client.channels.cache.get(guildAddChannelId);
    if (guildAddChannel) {
        const guildOwner = await guild.fetchOwner();
        const memberCount = guild.memberCount;

        const embed = new MessageEmbed()
            .setColor('#27ae60')
            .setTitle('🌟 | Nuevo servidor añadido')
            .setDescription(`¡Nos hemos unido a un nuevo servidor!\n» Nombre del Servidor: **${guild.name}**\n» ID del Servidor: **${guild.id}**\n» Owner: **${guildOwner.user.tag}**\n» Miembros: **${memberCount}**\n\n🎉 ¡Espero ser bien recibido en el servidor!`)
            .setFooter({ text: `Fecha de unión: ${new Date().toLocaleString()} | Guild-Information` })
            .setTimestamp();
        guildAddChannel.send({ embeds: [embed] });
    }
});

client.on('guildDelete', async (guild) => {
    const guildDeleteChannel = client.channels.cache.get(guildDeleteChannelId);
    if (guildDeleteChannel) {
        const guildOwner = await guild.fetchOwner();
        const memberCount = guild.memberCount;

        const embed = new MessageEmbed()
            .setColor('#e74c3c')
            .setTitle('👋 | He dejado un servidor')
            .setDescription(`He dejado un servidor.\n» Nombre del Servidor: **${guild.name}**\n» ID del Servidor: **${guild.id}**\n» Owner: **${guildOwner.user.tag}**\n» Miembros: **${memberCount}**\n\n😢 ¡Te extrañaremos!`)
            .setFooter({ text: `Fecha de despedida: ${new Date().toLocaleString()} | Guild-Information` })
            .setTimestamp();
        guildDeleteChannel.send({ embeds: [embed] });
    }
});

client.on('error', (error) => {
    console.error('Error:', error);
    const errorEmbed = new MessageEmbed()
        .setColor('#e74c3c')
        .setTitle('🚨 | Error Logs')
        .setDescription(`\`\`\`js\n${error.stack}\n\`\`\``)
        .setFooter({ text: 'Error Logging | Registros' })
        .setTimestamp();
    errorWebhook.send({ embeds: [errorEmbed] });
});
