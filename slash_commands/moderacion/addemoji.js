const { MessageEmbed, Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addemoji')
        .setDescription('📝 Añade un emoji personalizado al servidor')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('⭐ Emoji a añadir')
                .setRequired(true)),
    run: async (client, interaction, args) => {

        const emoticono = interaction.options.getString("emoji")

        try {
            if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                const noPermissionEmbed = new MessageEmbed()
                    .setColor("RED")
                    .setTitle('ID_EMOJI**ADD EMOJI** | Permisos Insuficientes')
                    .setDescription('➜ Debes tener permisos de `MANAGE_CHANNELS` para ejecutar este comando.');

                return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: false });
            }
            if (!interaction.guild.me.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                const noPermissionBotEmbed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('**ADD EMOJI** | Permiso Denegado')
                    .setDescription('➜ El bot no tiene permisos para añadir emojis.');

                return interaction.reply({ embeds: [noPermissionBotEmbed], ephemeral: true });
            }

            const emoticon = require('discord.js').Util.parseEmoji(emoticono);

            if (emoticon.id == null) {
                const embed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('**ADD EMOJI** | Emoji no Encontrado')
                    .setDescription(`➜ No pude encontrar este emoji, asegúrate de que no sea un __emoji de Discord__ predeterminado.`);

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            if (interaction.guild.emojis.cache.has(emoticon.id)) {
                const embed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('**ADD EMOJI** | Emoji ya Agregado')
                    .setDescription(`➜ Este emoji ya está en el servidor.`);

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const emoji = `https://cdn.discordapp.com/emojis/${emoticon.id}.${emoticon.animated ? 'gif' : 'png'}`

            interaction.guild.emojis.create(emoji, emoticon.name)
                .then(() => {
                    const successEmbed = new MessageEmbed()
                        .setColor('GREEN')
                        .setTitle('**ADD EMOJI** | Añadido Exitosamente')
                        .setDescription(`➜ Agregué el emoji con el nombre **\`${emoticon.name}\`**`)

                    interaction.reply({ embeds: [successEmbed] });
                })
                .catch(error => {
                    console.error('[ADD EMOJI SLASH ERROR LOG] >> Error al aceptar la sugerencia:', error);
                    const errorEmbed = new MessageEmbed()
                        .setColor('RED')
                        .setTitle('**ADD EMOJI** | Error al Añadir el Emoji')
                        .setDescription('➜ Hubo un error añadir el emoji. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                });
        } catch (error) {
            console.error('[ADD EMOJI SLASH ERROR LOG] >> Error al aceptar la sugerencia:', error);
            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**ADD EMOJI** | Error al Añadir el Emoji')
                .setDescription('➜ Hubo un error añadir el emoji. Por favor, inténtalo de nuevo. __Contacta con un developer si el error persiste.__');

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
