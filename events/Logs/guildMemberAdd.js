const { MessageEmbed } = require("discord.js");
const LogsChannel = require('../../database/models/ModLogModel.js');
const client = require('../../index.js');
const Schema = require("../../database/models/welcomeSystem.js"); 

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

client.on('guildMemberAdd', async (member) => {
    const guildId = member.guild.id;
    const logChannelId = await getLogChannel(guildId);
    
    if (logChannelId) {
        const logChannel = client.channels.cache.get(logChannelId);
        if (logChannel) {
            try {
                const joinEmbed = new MessageEmbed()
                    .setColor('#00FF00')
                    .setTitle('**MEMBER JOIN** | Un Miembro se ha unido al Servidor')
                    .setDescription(`**Usuario**: ${member.user} (${member.user.tag})\n**ID de Usuario**: ${member.user.id}\n**Fecha de Creación de la Cuenta**: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n**Miembros Actuales**: ${member.guild.memberCount}`)
                    .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() })
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                await sendLog(logChannel, joinEmbed);
            } catch (error) {
                console.error('[GUILD MEMBER JOIN EVENT LOG] >> Error al registrar la entrada de un usuario:', error);
            }
        }
    }

    try {
        const data = await Schema.findOne({ guildID: guildId });
        if (!data) return;

        const welcomeChannel = member.guild.channels.cache.get(data.channelID);
        if (!welcomeChannel) return;

        const welcomeEmbed = new MessageEmbed()
            .setTitle(`**¡Bienvenido, ${member.user.tag}!**`)
            .setDescription(`${data.Msg}
            
                > **Usuario**: <@${member.user.id}>
                > **Vota por mi**: https://github.com/TryReturn 
                > **ID**: \`${member.user.id}\`
                > **Miembros Actuales**: ${member.guild.memberCount}`)
            .setColor("#f28f0c")
            .setFooter({ text: `${member.guild.name} | Bienvenidas` })
            .setThumbnail(member.guild.iconURL());

        await welcomeChannel.send({ embeds: [welcomeEmbed] });
    } catch (error) {
        console.error('[GUILD MEMBER JOIN EVENT] >> Error al manejar el mensaje de bienvenida:', error);
    }
});
