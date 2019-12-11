const Discord = require('discord.js');
const client = new Discord.Client();
const bot = require('./basicFunctions.js');
var path = require('path');
const fs = require('fs');



client.on("message", message => {

});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));

client.login(config.token);