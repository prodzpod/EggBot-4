const bot = require('../basicFunctions.js');
module.exports = {
    category: 'other',
    perm: 'NONE',
    run: (function (client, message, args, locale) {
        message.channel.send({embed: {
            "title": "🏓 " + locale.command.ping.embedTitle,
            "description": bot.printf(locale.command.ping.embedDescription, "[" + client.pings.join('ms, ') + "ms]", client.ping + 'ms'),
            "color": 0xFF3333,
            "footer": locale.bot.embedFooter
        }});
        return null;
    })
}