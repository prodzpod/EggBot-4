const bot = require('../basicFunctions.js');
module.exports = {
    category: 'moderation',
    perm: 'MANAGE_GUILD',
    run: (function (client, message, args, locale) {
        switch (args[1].toLowerCase()) {
            case "prefix":
                bot.read(bot.directory + "config.json").then((file) => {
                    file.prefix[bot.getGuildID(message)] = args.slice(2).join(" ");
                    bot.write(bot.directory + "config.json", file);
                    message.channel.send({embed: {
                        "title": "🏓 " + locale.command.config.embedSuccessTitle,
                        "description": bot.printf(locale.command.config.embedSuccessDescription, args.slice(2).join(" ")),
                        "color": 0xFF3333,
                        "footer": locale.bot.embedFooter
                    }});
                })
                break;
            case "locale":
                fs.access(bot.directoryLocale + args[2] + ".json", (err) => {
                    if (err) {
                        bot.sendWarning(message.channel, locale.command.config.embedFailTitle, bot.printf(locale.command.config.embedFailDescription, args[2]), locale);
                        return;
                    }
                    bot.read(bot.directory + "config.json").then((file) => {
                        file.locale[bot.getGuildID(message)] = args[2];
                        bot.write(bot.directory + "config.json", file);
                        message.channel.send({embed: {
                            "title": "🏓 " + locale.command.config.embedSuccessTitle,
                            "description": bot.printf(locale.command.config.embedSuccessDescription, args[2]),
                            "color": 0xFF3333,
                            "footer": locale.bot.embedFooter
                        }});
                    })
                })
                break;
            default:
                fs.read(bot.directoryConfig + "0.json").then((file) => {
                    if (!file[args[1]]) { // show list of config

                    } else { // change config
                        fs.read(bot.directoryConfig + bot.getGuildID(message) + ".json").then((file2) => {
                            if (file2 == null) file2 = file
                            file[args[1]] = args.slice(2).join(" ");
                        })
                    }
                })
                break;
        }
        return null;
    })
}