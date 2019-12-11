const Discord = require('discord.js');
const client = new Discord.Client();
const bot = require('./basicFunctions.js');
let path = require('path');
const fs = require('fs');
let command = {};
let aliases = {};
let locale = {};

client.on("ready", () => {
    // INIT
    console.log('                                       \n')
    console.log('           ███  ████ ████ ███   ██  ███\n')
    console.log('           █    █    █    █  █ █  █  █ \n')
    console.log('           ███  █ ██ █ ██ ███  █  █  █ \n')
    console.log('           █    █  █ █  █ █  █ █  █  █ \n')
    console.log('           ███  ████ ████ ███   ██   █ \n')
    console.log('                                       \n')
    console.log('              ███████  ████   ████     \n')
    console.log('                 █       ██   ██       \n')
    console.log('                 █        ██ ██        \n')
    console.log('              ███████      ███         \n')
    console.log('                                       \n')
    console.log('           Prodzpod 2019               \n')
    console.log('              Multipurpose Discord Bot \n')
    console.log('                                       \n')
    console.log('initialized', new Date())
    console.log('[LOG] Base directory located:', bot.directory);
    console.log('[LOG] Reading commands from', bot.directoryCommand);
    fs.readdir(bot.directoryCommand, function (err, files) {
        //handling error
        if (err) {
            return console.error('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        let ext;
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            ext = path.extname(file);
            if (ext != ".js") return; 
            let cmd = require(bot.directoryCommand + file);
            let cmdName = path.basename(file, ext)
            command[cmdName] = cmd;
        });
    })
    console.log('[LOG] Reading locale from', bot.directoryLocale);
    fs.readdir(bot.directoryLocale, function (err, files) {
        //handling error
        if (err) {
            return console.error('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        let ext;
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            ext = path.extname(file);
            if (ext != ".json") return;
            bot.read(bot.directoryLocale + file).then((loc) => {
                for (let cmdName in loc.command) {
                    loc.command[cmdName].alias.forEach((item, index) => { aliases[item] = cmdName }) 
                }
                locale[path.basename(file, ext)] = loc;
            })
        });
    })
})

client.on("message", message => {
    // check prefix
    if (message.content.startsWith(bot.getPrefix(message))) {
        // check permission
        let rawCommand = message.content.slice((bot.getPrefix(message)).length);
        let args = rawCommand.split(/\s+/)
        let cmdName = aliases[args[0]];
        if (!cmdName) return; // invalid command
        try {
            // LOGGING
            console.log("[LOG] Command executed:", args)
            console.log("      from", (bot.isDM(message) ? "DM: @" + message.author.tag : "Channel: " + message.guild.name + ", #" + message.channel.name))
            if (!bot.isDM(message)) console.log("      by", '@' + message.author.tag);
            // PERM CHECK
            let currentLocale = locale[bot.getLocale(message)];
            let perm = command[cmdName].perm;
            if (!perm) perm = null;
            if (bot.checkPerms(message, perm)) { // perm check
                command[cmdName].run(client, message, args, currentLocale); // locale included
                /*
                * COMMAND EXPORT
                * category: category of the command
                * perm: required permission
                * hidden: is not seen from help or category thing (OPTIONAL)
                * run(client, message, args, locale): command itself
                */
               /*
               * LOCALE EXPORT - COMMAND
               * title: title of command
               * usage: usage of command
               * alias: [aliases, of, commands, in that, locale]
               * description: detailed desc of command
               */
            } else {
                bot.invalidPerms(message.channel, perm, currentLocale);
                console.log("[LOG] Execution failed: Invalid Permission");
            }
        } catch (e) { console.error(e) }
    }
});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));

client.login(bot.config.token);