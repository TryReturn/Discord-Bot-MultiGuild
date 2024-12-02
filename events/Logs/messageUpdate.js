const { MessageEmbed } = require("discord.js");
const LogsChannel = require('../../database/models/ModLogModel');
const client = require('../../index.js');

async function getLogChannel(guildId) {
    try {
        const logsData = await LogsChannel.findOne({ guildId });
        return logsData ? logsData.channelId : null;
    } catch (error) {
        console.error('[MESSAGE UPDATE EVENT LOG] >> Error al obtener el canal de logs desde la base de datos:', error);
        return null;
    }
}

async function sendLog(embed, logChannel) {
    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`[MESSAGE UPDATE EVENT LOG] >> Error al enviar log al canal ${logChannel.id}:`, error);
    }
}

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.author.bot || oldMessage.content === newMessage.content) return;

    const guildId = oldMessage.guild.id;
    const logChannelId = await getLogChannel(guildId);
    if (!logChannelId) return;

    const logChannel = client.channels.cache.get(logChannelId);
    if (!logChannel) return;

    try {
        const embed = new MessageEmbed()
            .setColor('#3498db')
            .setTitle('**MESSAGE EDIT** | Mensaje Editado')
            .setDescription(`**Del Usuario**: ${newMessage.author}\n**En el Canal**: <#${newMessage.channel.id}>\n**Nuevo Contenido**: ${newMessage.content}\n**Antiguo Contenido**: ${oldMessage.content}\n **Link de Mensaje**: [Link aquí para ir ⤣](https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id})`)
            .setFooter({ text: newMessage.guild.name, iconURL: newMessage.guild.iconURL() })
            .setThumbnail(newMessage.author.avatarURL({ dynamic: true }))
            .setTimestamp();

        await sendLog(embed, logChannel);
    } catch (error) {
        console.error('[MESSAGE UPDATE EVENT LOG] >> Error al registrar el mensaje editado:', error);
    }
});
