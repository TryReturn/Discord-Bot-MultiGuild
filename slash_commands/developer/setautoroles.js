const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const ServerAutorole = require('../../database/models/ServerAutorole');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setautoroles')
        .setDescription('🔧 Establece los roles automáticos para el servidor.')
        .addRoleOption(option => 
            option.setName('rol1')
                .setDescription('🔹 Elige el primer rol.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('descripcion1')
                .setDescription('📝 Descripción del primer rol.')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('rol2')
                .setDescription('🔹 Elige el segundo rol.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('descripcion2')
                .setDescription('📝 Descripción del segundo rol.')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('rol3')
                .setDescription('🔹 Elige el tercer rol.')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('descripcion3')
                .setDescription('📝 Descripción del tercer rol.')
                .setRequired(false))
        .addRoleOption(option => 
            option.setName('rol4')
                .setDescription('🔹 Elige el cuarto rol.')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('descripcion4')
                .setDescription('📝 Descripción del cuarto rol.')
                .setRequired(false))
        .addRoleOption(option => 
            option.setName('rol5')
                .setDescription('🔹 Elige el quinto rol.')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('descripcion5')
                .setDescription('📝 Descripción del quinto rol.')
                .setRequired(false))
        .addRoleOption(option => 
            option.setName('rol6')
                .setDescription('🔹 Elige el sexto rol.')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('descripcion6')
                .setDescription('📝 Descripción del sexto rol.')
                .setRequired(false)),

    async run(client, interaction) {
        const guildId = interaction.guildId;
        const roles = [];
        const descriptions = [];
        
        for (let i = 1; i <= 6; i++) {
            const role = interaction.options.getRole(`rol${i}`);
            const description = interaction.options.getString(`descripcion${i}`);
            if (role && description) {
                roles.push(role.id);
                descriptions.push(description);
            }
        }

        if (roles.length < 2) {
            return interaction.reply({ content: '| Debes agregar al menos 2 roles.', ephemeral: true });
        }

        let serverAutorole = await ServerAutorole.findOne({ guildId }).exec();
        if (!serverAutorole) {
            serverAutorole = new ServerAutorole({ guildId, roles, descriptions });
        } else {
            serverAutorole.roles = roles;
            serverAutorole.descriptions = descriptions;
        }
        await serverAutorole.save();

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setTitle('`root@bot/AutoRoles/information`\n📡 | Autoroles Establecidos')
            .setDescription('Los autoroles han sido establecidos correctamente. Aquí tienes tu configuración.')
            .addFields(
                { name: '🔹 Rol 1', value: `<@&${roles[0]}> 📝 ${descriptions[0]}`, inline: true },
                { name: '🔹 Rol 2', value: `<@&${roles[1]}> 📝 ${descriptions[1]}`, inline: true },
                { name: '🔹 Rol 3', value: `<@&${roles[2] || 'No definido'}> 📝 ${descriptions[2] || 'No definido'}`, inline: true },
                { name: '🔹 Rol 4', value: `<@&${roles[3] || 'No definido'}> 📝 ${descriptions[3] || 'No definido'}`, inline: true },
                { name: '🔹 Rol 5', value: `<@&${roles[4] || 'No definido'}> 📝 ${descriptions[4] || 'No definido'}`, inline: true },
                { name: '🔹 Rol 6', value: `<@&${roles[5] || 'No definido'}> 📝 ${descriptions[5] || 'No definido'}`, inline: true },
            )
            .setFooter({ text: `Powered - TryReturn [DEV]`, iconURL: interaction.guild.iconURL() })

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};