const { MessageEmbed } = require("discord.js");
const LogsChannel = require('../../database/models/ModLogModel');
const client = require('../../index.js');

async function getLogChannel(guildId) {
    try {
        const logsData = await LogsChannel.findOne({ guildId });
        return logsData ? logsData.channelId : null;
    } catch (error) {
        console.error('[MESSAGE DELETE EVENT LOG] >> Error al obtener el canal de logs desde la base de datos:', error);
        return null;
    }
}

async function sendLog(logChannel, embed) {
    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`[MESSAGE DELETE EVENT LOG] >> Error al enviar log al canal ${logChannel.id}:`, error);
    }
}

client.on("messageDelete", async (messageDelete) => {
    if (messageDelete.author == null || messageDelete.content == null) return;

    const guildId = messageDelete.guild.id;
    const logChannelId = await getLogChannel(guildId);
    if (!logChannelId) return;

    const logChannel = client.channels.cache.get(logChannelId);
    if (!logChannel) return;

    try {
        const messageContent = messageDelete.content || '`Era un embed`';

        const messageDeleteEmbed = new MessageEmbed()
            .setColor('ORANGE')
            .setTitle('**MESSAGE DELETE** | Mensaje Eliminado')
            .setDescription(`**Mensaje del Usuario**: ${messageDelete.author}\n**Contenido del Mensaje**: ${messageContent}\n**Canal**: <#${messageDelete.channel.id}>`)
            .setFooter({ text: messageDelete.guild.name, iconURL: messageDelete.guild.iconURL() })
            .setThumbnail(messageDelete.author.avatarURL({ dynamic: true }))
            .setTimestamp();

        await sendLog(logChannel, messageDeleteEmbed);
    } catch (error) {
        console.error('[MESSAGE DELETE EVENT LOG] >> Error al registrar el mensaje eliminado:', error);
    }
});
