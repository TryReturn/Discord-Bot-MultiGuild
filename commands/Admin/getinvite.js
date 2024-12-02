const { MessageEmbed } = require('discord.js');

const authorizedDevelopers = ['828991790324514887'];

module.exports = {
    name: 'getinvite',
    category: 'Admin',
    description: 'Genera un enlace de invitación para un servidor específico.',
    usage: '<serverID>',
    run: async (client, message, args) => {
        if (!authorizedDevelopers.includes(message.author.id)) {
            return message.reply({ content: 'Solo los desarrolladores autorizados pueden ejecutar este comando.' });
        }

        if (!args[0]) {
            return message.reply({ content: 'Debes proporcionar un ID de servidor.' });
        }

        const serverID = args[0];

        try {
            const guild = await client.guilds.fetch(serverID);
            const channels = await guild.channels.fetch();

            const textChannels = channels.filter(channel => channel.type === 'GUILD_TEXT');

            if (textChannels.size === 0) {
                return message.author.send({ content: 'No se encontraron canales de texto en este servidor.' });
            }

            const randomChannel = textChannels.random();
            const invite = await randomChannel.createInvite({ maxAge: 0, maxUses: 0 });

            message.author.send({ content: `Aquí tienes tu invitación para el servidor **${guild.name}**: ${invite}` });
            await message.delete();
        } catch (error) {
            console.error(`[ERROR] >> Error al generar la invitación: ${error.message}`);
            return message.author.send({ content: 'Ocurrió un error al generar la invitación. Asegúrate de que el ID del servidor sea correcto y que tengas los permisos necesarios.' });
        }
    },
};
