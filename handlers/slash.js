const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { readdirSync } = require('fs');
const config = require('../config.json');
const ascii = require('ascii-table');
let table = new ascii('Slash Commands Handler');
table.setHeading('N°', 'COMMANDS:', 'STATUS:');
let cmd = [];
let commandNames = new Set();
let duplicates = new Set();

module.exports = (client) => {
  readdirSync('./slash_commands/').forEach((dir) => {
    const commands = readdirSync(`./slash_commands/${dir}`).filter((file) => file.endsWith('.js'));
    for (let file of commands) {
      const command = require(`../slash_commands/${dir}/${file}`);
      if (command.data && command.data.name) {
        if (commandNames.has(command.data.name)) {
          duplicates.add(command.data.name);
          table.addRow(client.slash_commands.size, file, '🟥 (DUPLICADO)');
        } else {
          commandNames.add(command.data.name);
          cmd.push(command.data.toJSON());
          client.slash_commands.set(command.data.name, command);
          table.addRow(client.slash_commands.size, file, '🟩');
        }
      } else {
        table.addRow(client.slash_commands.size, file, '🟥 (INVALIDO)');
        continue;
      }
    }
  });

  if (duplicates.size > 0) {
    console.log('[WARNING] >> Comandos duplicados encontrados:');
    duplicates.forEach((name) => {
      console.log(`- ${name}`);
    });
  }

  const rest = new REST({ version: '9' }).setToken(process.env.TOKEN || config.client.TOKEN);

  (async () => {
    try {
      if (!config.client.ID) {
        console.log('[WARN] >> La ID del cliente no es válida');
        process.exit(1);
      }

      console.log('[SLASH_CMD] >> Actualizando comandos slash...');

      if (!config.handlers.slash.TESTING_GUILD_ID) {
        await rest.put(Routes.applicationCommands(config.client.ID), { body: cmd });
      } 
      else {
        console.log('[NOTE] >> TesT_Guild habilitada. Registrando comandos para la guild de prueba.');
        await rest.put(
          Routes.applicationGuildCommands(config.client.ID, config.handlers.slash.TESTING_GUILD_ID),
          { body: cmd }
        );
      }

      console.log(table.toString());
      console.log(`[SLASH_CMD] >> Successfully loaded ${client.slash_commands.size} slash commands`);
    } catch (error) {
      console.error('[ERROR] >> Error al registrar los comandos slash:', error);
    }
  })();
};
