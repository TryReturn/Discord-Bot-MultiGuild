const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('🌐 Muestra información general del servidor'),
    async run(client, interaction) {
        const server = interaction.guild;
        const owner = await server.fetchOwner();

        const svinfo = new MessageEmbed()
            .setColor("BLUE")
            .setThumbnail(server.iconURL({ dynamic: true }))
            .setTitle('🎮 **|** **Información General del Servidor**')
            .setDescription(`
🡺 **__Nombre__**: \`${server.name}\` (${server.id})
🡺 **__Owner__**: ${owner} (${server.ownerId})
🡺 **__Nivel de Verificación__**: \`${server.verificationLevel}\`
🡺 **__Fecha de creación__**: \`${server.createdAt.toLocaleString()}\``)
            .addFields(
                { name: '🡺 __Roles y Canales__', value: `**Roles**: \`${server.roles.cache.size}\`\n**Canales de Texto**: \`${server.channels.cache.filter(x => x.type === "GUILD_TEXT").size}\`\n**Canales de Voz**: \`${server.channels.cache.filter(x => x.type === "GUILD_VOICE").size}\`\n**Categorias**: \`${server.channels.cache.filter(x => x.type === "GUILD_CATEGORY").size}\``, inline: true },
                { name: '🡺 __Emojis & Stickers__', value: `**Emojis**: \`${server.emojis.cache.size}\`\n**Stickers**: \`${server.stickers.cache.size}\``, inline: true },
                { name: '🡺 __Miembros__', value: `**Miembros**: \`${server.memberCount}\`\n**Humanos**: \`${server.members.cache.filter(x => !x.user.bot).size}\`\n**Bots**: \`${server.members.cache.filter(x => x.user.bot).size}\``, inline: true },
                { name: '🡺 __Boost Info__', value: `**Boosts**: \`${server.premiumSubscriptionCount || '0'}\`\n**Nievel de Boost**: \`${server.premiumTier || '0'}\``, inline: true }
            );

        interaction.reply({ embeds: [svinfo] });
    },
};
