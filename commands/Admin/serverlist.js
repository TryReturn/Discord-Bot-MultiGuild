const { MessageEmbed } = require('discord.js');

const authorizedDevelopers = ['828991790324514887'];

module.exports = {
    name: 'serverlist',
    category: 'Admin',
    description: 'Muestra una lista de servidores donde el bot está presente.',
    run: async (client, message) => {
        if (!authorizedDevelopers.includes(message.author.id)) {
            return message.reply({ content: 'Solo los desarrolladores autorizados pueden ejecutar este comando.' });
        }

        const guilds = client.guilds.cache.map(guild => ({
            id: guild.id,
            name: guild.name,
            memberCount: guild.memberCount,
            owner: guild.ownerId,
        }));

        const uniqueGuilds = Array.from(new Set(guilds.map(guild => guild.id)))
            .map(id => guilds.find(guild => guild.id === id));

        const totalServers = uniqueGuilds.length;
        const totalMembers = uniqueGuilds.reduce((acc, guild) => acc + guild.memberCount, 0);

        const serversPerPage = 5;
        const totalPages = Math.ceil(uniqueGuilds.length / serversPerPage);
        let currentPage = 0;

        const createEmbed = () => {
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('🌐 Lista de Servidores')
                .setDescription('')
                .setFooter({ text: `Total Servidores: ${totalServers} | Total Miembros: ${totalMembers} | Página ${currentPage + 1} de ${totalPages}` });

            const start = currentPage * serversPerPage;
            const end = start + serversPerPage;
            const currentGuilds = uniqueGuilds.slice(start, end);

            currentGuilds.forEach(guild => {
                embed.addFields(
                    { name: `🏢 ${guild.name}`, value: `**ID:** ${guild.id}\n**Owner:** <@${guild.owner}>\n**Miembros:** ${guild.memberCount}`, inline: false }
                );
            });

            return embed;
        };

        const embed = createEmbed();

        const messageSent = await message.channel.send({ embeds: [embed] });

        await messageSent.react('◀️');
        await messageSent.react('▶️');

        const filter = (reaction, user) => {
            return ['◀️', '▶️'].includes(reaction.emoji.name) && !user.bot;
        };

        const collector = messageSent.createReactionCollector({ filter, time: 60000 });

        collector.on('collect', (reaction, user) => {
            reaction.users.remove(user.id);

            if (reaction.emoji.name === '◀️' && currentPage > 0) {
                currentPage--;
            } else if (reaction.emoji.name === '▶️' && currentPage < totalPages - 1) {
                currentPage++;
            }

            const newEmbed = createEmbed();
            messageSent.edit({ embeds: [newEmbed] });
        });

        collector.on('end', () => {
            messageSent.reactions.removeAll();
        });
    },
};
