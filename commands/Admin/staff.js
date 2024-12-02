const { MessageEmbed, Permissions } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'staff',
    category: 'Admin',
    aliases: ['managestaff'],
    description: 'Añade o elimina un usuario del personal.',
    usage: '<add/remove> <userID>',
    run: async (client, message, args) => {
        if (message.author.id !== '828991790324514887') {
            const ownerOnlyEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**STAFF** | Acceso Restringido')
                .setDescription('Solo el propietario del bot puede ejecutar este comando.');

            return message.reply({ embeds: [ownerOnlyEmbed] });
        }

        const action = args[0];
        const userID = args[1];

        if (!action || !userID) {
            const invalidCommandEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**STAFF** | Comando Inválido')
                .setDescription('Por favor, proporciona una acción (add/remove) y un ID de usuario.');

            return message.reply({ embeds: [invalidCommandEmbed] });
        }

        const staffList = JSON.parse(fs.readFileSync('stafflist.json', 'utf-8'));

        if (action === 'add') {
            if (!staffList.includes(userID)) {
                staffList.push(userID);

                fs.writeFileSync('stafflist.json', JSON.stringify(staffList));

                const addedToStaffEmbed = new MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('**STAFF** | Usuario Añadido')
                    .setDescription(`Usuario con ID (**${userID}**) añadido al personal correctamente.`);

                return message.reply({ embeds: [addedToStaffEmbed] });
            } else {
                const alreadyInStaffEmbed = new MessageEmbed()
                    .setColor('YELLOW')
                    .setTitle('**STAFF** | Usuario Registrado')
                    .setDescription(`El usuario con ID (**${userID}**) ya está en el personal.`);

                return message.reply({ embeds: [alreadyInStaffEmbed] });
            }
        } else if (action === 'remove') {
            if (staffList.includes(userID)) {
                const updatedStaffList = staffList.filter(id => id !== userID);

                fs.writeFileSync('stafflist.json', JSON.stringify(updatedStaffList));

                const removedFromStaffEmbed = new MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('**STAFF** | Usuario Eliminado')
                    .setDescription(`Usuario con ID (**${userID}**) eliminado del personal correctamente.`);

                return message.reply({ embeds: [removedFromStaffEmbed] });
            } else {
                const notInStaffEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('**STAFF** | Usuario no Registrado')
                    .setDescription(`El usuario con ID (**${userID}**) no está en el personal.`);

                return message.reply({ embeds: [notInStaffEmbed] });
            }
        } else {
            const invalidActionEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**STAFF** | Acción Inválida')
                .setDescription('Por favor, proporciona una acción válida (**add/remove**).');

            return message.reply({ embeds: [invalidActionEmbed] });
        }
    },
};
