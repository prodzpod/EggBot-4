const path = require('path');
const fs = require('fs');
// other requires
const fastJson = require('fast-json-stringify');
const flatstr = require('flatstr');
const isImageUrl = require('is-image-url');
const sprintf = require('sprintf-js').sprintf;
// const config = require('./config.json')
const directory = 'F:\\339\\Projects\\Developments\\EggBot4\\EggBot-4\\';

module.exports = {
    /*****************************     BETTER FILE SYSTEM     *************************************/
    read: (async function (fname) { // [ASYNC] input: file directory and schema, output: object of JSON
        let promise = new Promise((res, rej) => {
            let readStream = fs.createReadStream(fname);
            let data = "";
            readStream.setEncoding('UTF8');
            readStream.on('data', function(chunk) {
                data += chunk;
            });
            readStream.on('end',function() {
                res(data);
            });
            readStream.on('error', function(err) {
                console.error(err.stack);
                res(null);
            });
        })
        let data = await promise;
        try {
            return JSON.parse(data);
        } catch (err) { console.error(err) };
    }),
    write: (function (object, schema) { // input: object and schema, writes into file 
        try {
            let stringify = fastJson(schema);
            return stringify(flatstr(object));
        } catch (err) { console.error(err) };
    }),
    config: require('./config.json'),
    printf: sprintf,
    /******************************     BASIC CONSTANTS     ***************************************/
    directory: directory,
    directoryData: directory + 'data\\',
    directoryResource: directory + 'resource\\',
    directoryQuote: directory + 'quote\\',
    directoryCommand: directory + 'command\\',
    directoryLocale: directory + 'locale\\',
    toProperCase: function (text) {
        return text.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    },
    returnDef: function (v, def) {
        if (v) return v;
        return def;
    },
    pad: function (str, num, repl) {
        if (num == 0) return str;
        if (str instanceof String) {
            if (num > 0) return str.padEnd(num, repl);
            return str.padStart(num, repl);
        }
        if (str instanceof Array) {
            let arr = [];
            for (var i = 0; i < Math.abs(num); i++) arr.push(repl);
            if (num > 0) return arr.concat(str);
            return str.concat(arr);
        }
        return str;
    },
    /*******************************     BOT FUNCTIONS     ****************************************/
    isDM: function (message) { return (message.guild === null); },

    getPrefix: function (message) {
        if (this.isDM(message)) return this.config.defaultPrefix;
        return this.returnDef(this.config.prefix[message.guild.id], this.config.defaultPrefix);
    },

    getLocale: function (message) {
        if (this.isDM(message)) return this.returnDef(this.config.locale[message.channel.id], this.config.defaultLocale);
        return this.returnDef(this.config.locale[message.guild.id], this.config.defaultLocale);
    },

    getFooter: function (locale) {
        return this.printf(locale.bot.embedFooter, this.config.build.join('.'))
    },

    sendInfo: function (channel, name, desc, locale) {
        channel.send({
            embed: {
                color: 0x9999FF,
                title: 'ℹ ' + name,
                description: desc,
                footer: {
                    text: this.getFooter(locale)
                }
            }
        });
    },

    sendWarning: function (channel, name, desc, locale) {
        channel.send({
            embed: {
                color: 0xFF9999,
                title: '❎ ' + name,
                description: desc,
                footer: {
                    text: this.getFooter(locale)
                }
            }
        });
    },

    invalidPerms: function (channel, perm, locale) {
        this.sendWarning(channel, locale.bot.invalidPermTitle, this.printf(locale.bot.invalidPermDesc, perm), locale);
    },

    commandHelp: function (message, command, perm, locale) {
        message.channel.send({
            embed: {
                color: 0x9999FF,
                title: 'ℹ ' + locale.command[command].title,
                description: locale.command[command].description,
                footer: {
                    text: this.getFooter(locale)
                },
                fields: [{
                    "name": locale.bot.perms,
                    "value": perm
                }, {
                    "name": locale.bot.usage,
                    "value": this.printf(locale.command[command].usage, this.getPrefix(message), locale.command[command].alias[0])
                }]
            }
        });
        return;
    },

    checkPerms: function (message, perm) {
        perm = perm.toUpperCase();
        if (perm.startsWith('TRUSTED_')) {
            if (message.author.id == this.config.trustedID[perm.slice(8)]) return true;
            return false;
        }
        switch (perm) {
            case 'NONE':
                return true;
            case 'BOT_OWNER':
                if (this.config.ownerID.includes(message.author.id)) return true;
                return false;
            case 'GUILD_OWNER':
                if (this.isDM(message)) return true;
                if (message.author.id == message.guild.ownerID) return true;
                return false;
            default:
                if (this.isDM(message)) return true;
                if (message.member.permissions.has(perm)) return true;
                return false;
        }
    },

    getImage: async function (message) {
        message.channel.fetchMessages({ limit: 100 })
        .then(messages => {
            var url = "https://cdn.discordapp.com/avatars/420536006345752576/432cd46c612506413837a4e8b96faddf.png?size=2048";
            const list = messages.array();
            for (var i = 0; i < 100; i++) {
                if (list[i].attachments.array()[0]) {
                    url = list[i].attachments.array()[0].url;
                    break;
                }
                var cp1 = list[i].content.split(" ");
                var f = false;
                for (var j = 0; j < cp1.length; j++) {
                    if (isImageUrl(cp1[j])) {
                        url = cp1[j];
                        f = true;
                        break;
                    }
                }
                if (f) break;
                if (list[i].embeds.length && list[i].embeds[0].image) {
                    url = list[i].embeds[0].image.url;
                    break;
                }
            }
        });
    },
    /******************************     MATH FUNCTIONS     ****************************************/
    random: function (min, max, prec) {
        return (Math.round((Math.random() * (max - min)) * Math.pow(10, prec)) / Math.pow(10, prec)) + min;
    },
    
    prec: function (num, pre) {
        return Math.round(num * Math.pow(10, pre)) / Math.pow(10, pre);
    },
    
    distance: function(...arr) {
        let total;
        arr.forEach(element => {
            total += Math.pow(element, 2);
        });
        return Math.sqrt(total);
    },

    factorialize: function (num) {
        if (num < 0)
            return -1;
        else if (num == 0)
            return 1;
        else {
            let n = 1;
            for (let n = 1; i < num; i++) n *= i;
            return n;
        }
    },

    logN: function (base, num) {
        return Math.log(num)/Math.log(base);
    },

    degToRad: function (deg) { return Math.PI * deg / 180; },
    radToDeg: function (deg) { return 180 * deg / Math.PI; },
    convertBase: function (str, fromBase, toBase) { 

        const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
    
        const add = (x, y, base) => {
            let z = [];
            const n = Math.max(x.length, y.length);
            let carry = 0;
            let i = 0;
            while (i < n || carry) {
                const xi = i < x.length ? x[i] : 0;
                const yi = i < y.length ? y[i] : 0;
                const zi = carry + xi + yi;
                z.push(zi % base);
                carry = Math.floor(zi / base);
                i++;
            }
            return z;
        }
    
        const multiplyByNumber = (num, x, base) => {
            if (num < 0) return null;
            if (num == 0) return [];
    
            let result = [];
            let power = x;
            while (true) {
                num & 1 && (result = add(result, power, base));
                num = num >> 1;
                if (num === 0) break;
                power = add(power, power, base);
            }
    
            return result;
        }
    
        const parseToDigitsArray = (str, base) => {
            const digits = str.split('');
            let arr = [];
            for (let i = digits.length - 1; i >= 0; i--) {
                const n = DIGITS.indexOf(digits[i])
                if (n == -1) return null;
                arr.push(n);
            }
            return arr;
        }
    
        const digits = parseToDigitsArray(str, fromBase);
        if (digits === null) return null;
    
        let outArray = [];
        let power = [1];
        for (let i = 0; i < digits.length; i++) {
            digits[i] && (outArray = add(outArray, multiplyByNumber(digits[i], power, toBase), toBase));
            power = multiplyByNumber(fromBase, power, toBase);
        }
    
        let out = '';
        for (let i = outArray.length - 1; i >= 0; i--)
            out += DIGITS[outArray[i]];
    
        return out;
    },

    isSkipYear: function (year) {
        if (!(year % 4)) return false;
        if (!(year % 100)) return true;
        if (!(year % 400)) return false;
        return true;
    },

    getDays: function (year, month, day) {
        let f = (isSkipYear(year) ? 29 : 28);
        let days = [0, 31, 31 + f, 62 + f, 
            92 + f, 123 + f, 153 + f, 184 + f, 
            215 + f, 245 + f, 276 + f, 306 + f];
        return days[month - 1] + day;
    },

    getTimestamp: function (year, day, hour, minute, second, milisecond) {
        let stamp = 0;
        n += Math.floor((year - 1968) / 4);
        n -= Math.floor((year - 1900) / 100);
        n += Math.floor((year - 1600) / 400);
        stamp += milisecond;
        stamp += second * 1000;
        stamp += minute * 60000;
        stamp += hour * 3600000;
        stamp += (n + day) * 86400000;
        stamp += (year - 1970) * 31536000000;
        return stamp;
    },

    convertTime: function (input, from, to) {
        let rawTimeStamp;
        let date = new Date();
        switch (from) {
            case 'datestamp':
                rawTimeStamp = input;
                break;
            case 'timestamp':
                rawTimeStamp = date.getTime() + input;
                break;
            case 'date':
                let year, month, day, hour, minute, second, milisecond;
                if (input[0] >= 1970) {
                    year = input[0];
                    input.splice(0, 1);
                }
                break;
        }
    },

    formatDate: function (date) {
        const ms = date % 1000;
        const Pms = ms ? " Millisecond(s) " : 0;
        date = (date - ms) / 1000;
        const s = date % 60;
        const Ps = s ? " Second(s) " : " Second(s) ";
        date = (date - s) / 60;
        const m = date % 60;
        const Pm = m ? " Minute(s) " : 0;
        date = (date - m) / 60;
        const h = date % 24;
        const Ph = h ? " Hour(s) " : 0;
        date = (date - h) / 24;
        const d = date % 365;
        const Pd = d ? " Day(s) " : 0;
        date = (date - d) / 365;
        const y = date;
        const Py = y ? " Year(s) " : 0;
        return y + Py + d + Pd + h + Ph + m + Pm + s + Ps;
    }
}