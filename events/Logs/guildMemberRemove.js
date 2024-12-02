const { MessageEmbed } = require("discord.js");
const LogsChannel = require('../../database/models/ModLogModel.js');
const leaveSchema = require("../../database/models/leaveSystem");
const client = require('../../index.js');

async function getLogChannel(guildId) {
    try {
        const logsData = await LogsChannel.findOne({ guildId });
        return logsData ? logsData.channelId : null;
    } catch (error) {
        console.error('[GUILD MEMBER LEAVE EVENT LOG] >> Error al obtener el canal de logs desde la base de datos:', error);
        return null;
    }
}

async function sendLog(logChannel, embed) {
    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`[GUILD MEMBER LEAVE EVENT LOG] >> Error al enviar log al canal ${logChannel.id}:`, error);
    }
}

client.on('guildMemberRemove', async (member) => {
    const guildId = member.guild.id;
    
    const logChannelId = await getLogChannel(guildId);
    if (!logChannelId) return;

    const logChannel = client.channels.cache.get(logChannelId);
    if (!logChannel) return;

    try {
        const leaveEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('**MEMBER LEAVE** | Un Miembro ha abandonado el Servidor')
            .setDescription(`**Usuario**: ${member.user} (${member.user.tag})\n**ID de Usuario**: ${member.user.id}\n**Fecha de Creación de la Cuenta**: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n**Miembros Actuales**: ${member.guild.memberCount}`)
            .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await sendLog(logChannel, leaveEmbed);
    } catch (error) {
        console.error('[GUILD MEMBER LEAVE EVENT LOG] >> Error al registrar la salida de un usuario:', error);
    }

    try {
        const data = await leaveSchema.findOne({ guildID: guildId });
        if (!data) return;

        const leaveChannel = member.guild.channels.cache.get(data.channelID);
        if (!leaveChannel) return;

        const leaveMessageEmbed = new MessageEmbed()
            .setTitle(`**¡Adiós, ${member.user.tag}!**`)
            .setDescription(`${data.Msg}
            
                > **Usuario**: <@${member.user.id}>
                > **Vota por mi**: https://github.com/TryReturn 
                > **ID**: \`${member.user.id}\`
                > **Miembros Actuales**: ${member.guild.memberCount}`)
            .setColor("#f28f0c")
            .setFooter({ text: `${member.guild.name} | Despedidas` })
            .setThumbnail(member.guild.iconURL());

        await leaveChannel.send({ embeds: [leaveMessageEmbed] });
    } catch (error) {
        console.error('[GUILD MEMBER LEAVE EVENT] >> Error al manejar el mensaje de despedida:', error);
    }
});
