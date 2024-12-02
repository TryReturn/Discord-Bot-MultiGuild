const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('📜 Muestra una lista de mis comandos.'),
    async run(client, interaction) {
        const categories = {
            "Gestión del Servidor 💡": [
                { name: 'setallowchannel', description: '➥ Configura el canal permitido para el uso de /suggest.' },            
            ],
            "Moderación 💼": [
                { name: 'addemoji', description: '➥ Añade un emoji personalizado a tu servidor.' },
            ],
            "Utilidad Pública 👥": [
                { name: 'suggest', description: '➥ Comparte tus sugerencias para mejorar el servidor.' },
            ],
            "Juegos e Interacción 🎮": [
                { name: 'kiss', description: '➥ Besa a alguien apasionadamente.' },
            ],
        };

        const rowMenu = new MessageActionRow()
            .addComponents([
                new MessageSelectMenu()
                    .setCustomId("help-menu")
                    .setPlaceholder("💥 ➥ github.com/TryReturn ")
                    .addOptions(Object.keys(categories).map(cat => ({
                        label: cat,
                        value: cat
                    })))
            ]);

        await interaction.reply({
            embeds: [{
                title: "Selecciona una categoría del menú de selección a continuación para ver mis comandos.",
                color: "RANDOM",
                footer: ({ text: `Utiliza esta opción para obtener ayuda de comandos.` })
            }],
            components: [rowMenu]
        });

        const filter = i => i.customId === 'help-menu' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 180000, // 3 minutos (180000 ms)
        });

        collector.on('collect', async (col) => {
            await col.deferUpdate().catch(() => { });

            try {
                const [category] = col.values;

                const embedCommand = new MessageEmbed()
                    .setTitle(`🪧 Categoría: ${category}`)
                    .setColor("RANDOM")
                    .setDescription("Ejecute comandos para <@1210959526413606912> con `/`")
                    .addFields(
                        categories[category].map((cmd) => ({
                            name: `${cmd.name ? `\`/${cmd.name}\`` : "unknown.js"}`,
                            value: `${cmd.description ? `${cmd.description}` : "> No hay descripción para este comando."}`,
                        }))
                    )
                    .setFooter({ text: "Para utilizar los comandos seleciona el icono del bot." });

                interaction.editReply({ embeds: [embedCommand], components: [rowMenu] });
            } catch (e) {
                console.error(e);
            }
        });

        collector.on('end', () => {
                });
    },
};
