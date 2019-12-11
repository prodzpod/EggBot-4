const bot = require('../basicFunctions.js');
module.exports = {
    category: 'other',
    perm: 'NONE',
    hidden: true,
    run: (function (client, message, args, locale) {
        message.channel.send(locale.command.template.output);
        return null;
    })
}