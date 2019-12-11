const bot = require('../basicFunctions.js');
module.exports = {
    category: 'other',
    perm: 'BOT_OWNER',
    hidden: true,
    run: (function (client, message, args, locale) {
        message.channel.send("E");
        return null;
    })
}