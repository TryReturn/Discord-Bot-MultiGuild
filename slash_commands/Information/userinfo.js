const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('🌐 Muestra información sobre un usuario')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('👥 El usuario sobre el que desea obtener información.')
        ),
    async run(client, interaction) {
        const userOption = interaction.options.getUser('usuario');
        const user = userOption ? userOption : interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        let status = "__Sin estado__";
        let activityState = "__Sin actividad__";
        let boostInfo = "__No está boosteando el servidor__";

        if (member && member.presence) {
            switch (member.presence.status) {
                case "online":
                    status = "**En línea**";
                    break;
                case "dnd":
                    status = "**No molestar**";
                    break;
                case "idle":
                    status = "**Ausente**";
                    break;
                case "offline":
                    status = "**Desconectado**";
                    break;
            }

            if (member.presence.activities && member.presence.activities.length > 0) {
                activityState = member.presence.activities[0].state;
            }
        }

        const booster = interaction.guild.members.cache.get(user.id);
        if (booster && booster.premiumSinceTimestamp) {
            const premiumSince = new Date(booster.premiumSinceTimestamp).toLocaleDateString();
            boostInfo = `Boosteando desde: **${premiumSince}**`;
        }

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setTitle('📂 **|** Información del usuario')
            .addFields(
                {
                    name: ' > :calendar_spiral: __Fechas__', value: `
                > **Creación de Cuenta:** <t:${parseInt(user.createdTimestamp / 1000)}:F>
                > **Entrada al Servidor:** <t:${parseInt(member.joinedTimestamp / 1000)}:F>
            `},
                {
                    name: '> :busts_in_silhouette: __Información General__', value: `
                    > **Apodo:** ${member ? member.displayName : "Sin apodo"}
                    > **ID de Usuario:** ${user.id}
                    > **Estado:** ${status}
                    > **Actividad:** ${activityState}
                    > **Avatar:** [Click aquí](${user.displayAvatarURL({ dynamic: true, size: 4096 })})
                    > **Boost:** ${boostInfo}
                `}
            )
            .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        const button = {
            type: 1,
            components: [{
                type: 2,
                label: 'Ver Roles 📜',
                style: 1,
                custom_id: 'view_roles',
            }],
        };

        await interaction.reply({ embeds: [embed], components: [button] });

        const filter = (buttonInteraction) => buttonInteraction.customId === 'view_roles' && buttonInteraction.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (buttonInteraction) => {
            await buttonInteraction.deferUpdate();

            const roles = member.roles.cache
                .sort((a, b) => b.position - a.position)
                .map(role => `> ${role.toString()}`);

            const rolesEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('📜 **|** Roles')
                .setDescription(roles.length > 0 ? roles.join('\n') : 'Sin roles')
                .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            await interaction.followUp({ embeds: [rolesEmbed], ephemeral: true });
        });

        collector.on('end', () => {
            interaction.editReply({ components: [] });
        });
    },
};
