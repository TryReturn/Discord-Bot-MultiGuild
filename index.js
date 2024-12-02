console.clear();
const { Client, Collection } = require("discord.js");
const fs = require("fs");
const chalk = require('chalk');
const config = require("./config.json");
const db = require("../database/index")
const users = new Map();

const client = new Client({
    intents: 32767
});

console.clear();
console.log(chalk.blue(chalk.bold(`System`)), (chalk.white(`>>`)), (chalk.green(`Starting up`)), (chalk.white(`...`)))
console.log(`\u001b[0m`)
console.log(chalk.red(`©  C.E.O @YOUR BOT NAME - ${new Date().getFullYear()}`))
console.log(chalk.red(`©  C.E.O @ConsterSolutions ᴛᴍ`))
console.log(chalk.red(`©  C.E.O © Developer by TryReturn ᴛᴍ`))
console.log(`\u001b[0m`)
console.log(`\u001b[0m`)
console.log(chalk.blue(chalk.bold(`System`)), (chalk.white(`>>`)), chalk.red(`Version ${require(`${process.cwd()}/package.json`).version}`), (chalk.green(`loaded`)))
console.log(`\u001b[0m`);

client.commands = new Collection();
client.slash_commands = new Collection();
client.aliases = new Collection();
client.events = new Collection();
client.categories = fs.readdirSync("./commands");

const { GiveawaysManager } = require('discord-giveaways');
client.giveawaysManager = new GiveawaysManager(client, {
    storage: "./giveaways.json",
    default: {
        botsCanWin: false,
        embedColorEnd: `RED`,
        lastChance: {
            enabled: true,
            content: '⚠️ **Última oportunidad de entrar** ⚠️',
            threshold: 5000,
            embedColor: `RED`,
            reaction: 'CUSTOM_EMOJI_ID'
        }
    }
});

module.exports = client;

["prefix", "slash", "event"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

process.on("uncaughtException", (err) => {
    console.error('[ERROR] >> Uncaught Exception:', err);
});

process.on('unhandledRejection', err => {
    console.log(`[ERROR] >> Unhandled promise rejection: ${err.message}.`);
    console.log(err);
});

const AUTH = process.env.TOKEN || config.client.TOKEN;
if (!AUTH) {
    console.warn("[WARN] >> El Token del bot es invalido o no esta correcto.").then(async () => process.exit(1));
} else {
    client.login(AUTH).catch(() => console.log("[WARN] >> Enable the 3 Gateaway Intents."));
}


