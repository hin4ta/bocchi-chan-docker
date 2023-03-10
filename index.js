console.log("start");

const Eris = require("eris");
const time = require("./app/service/fDatetime")
const sequelize = require("./app/service/database")
const UserStatus = require("./app/models/UserStatus")
const path = require('path')
const fs = require('fs');
// const ENV_PATH = path.join(__dirname, '../../.env');
// require('dotenv').config({path: ENV_PATH});
require('dotenv').config();
var bot = new Eris(process.env.TOKEN);

bot.on("error", (err) => {
    if (err.code === 1006) return;
});

bot.on("ready", () => {
    console.log("Ready");
    sequelize.authenticate()
    .then(()       => { console.log('Success test connection');        })
    .catch((error) => { console.log('Failure test connection', error); });
});

bot.on("voiceChannelJoin", async (member, newChannel) => {
  // if(newChannel.guild.id === )
  console.log(newChannel.guild.id, newChannel.guild.name )
  if(newChannel.guild.id === process.env.GUILD_ID) {
    bot.createMessage(process.env.CHANNEL1, time.formatTime() + " に " + (member.nick ? member.nick : member.username) + " が " + newChannel.name + " に入室しました。");
    try {
      let newStatus = await UserStatus.create({
        user_id: member.id,
        name: member.username,
        guild_id: member.guild.id,
        io: 1
      });
    } catch(ex) {
      console.log(ex);
    }
  } else if(newChannel.guild.id === process.env.GUILD_ID2) {
    bot.createMessage(process.env.CHANNEL2, time.formatTime() + " に " + (member.nick ? member.nick : member.username) + " が " + newChannel.name + " に入室しました。");
  }

});

bot.on("voiceChannelLeave", async (member, oldChannel) => {
  console.log(oldChannel.guild.id, oldChannel.guild.name )
  if(oldChannel.guild.id === process.env.GUILD_ID) {
    bot.createMessage(process.env.CHANNEL1, time.formatTime() + " に " + (member.nick ? member.nick : member.username)  + " が " + oldChannel.name + " から退出しました。");
    try {
      let newStatus = await UserStatus.create({
        user_id: member.id,
        name: member.username,
        guild_id: member.guild.id,
        io: 0
      });
    } catch(ex) {
      console.log(ex);
    }
  } else if(oldChannel.guild.id === process.env.GUILD_ID2) {
    bot.createMessage(process.env.CHANNEL2, time.formatTime() + " に " + (member.nick ? member.nick : member.username)  + " が " + oldChannel.name + " から退出しました。");
  }
});

bot.on("voiceChannelSwitch", async (member, newChannel, oldChannel) => {
  console.log(newChannel.guild.id, newChannel.guild.name )
  if(newChannel.guild.id === process.env.GUILD_ID) {
    bot.createMessage(process.env.CHANNEL1, time.formatTime() + " に " + (member.nick ? member.nick : member.username) + " が " + oldChannel.name + " から " + newChannel.name + " に移動しました。");
    try {
      let newStatus = await UserStatus.create({
        user_id: member.id,
        name: member.username,
        guild_id: member.guild.id,
        io: 3
      });
    } catch(ex) {
      console.log(ex);
    }
  } else if(newChannel.guild.id === process.env.GUILD_ID2) {
    bot.createMessage(process.env.CHANNEL2, time.formatTime() + " に " + (member.nick ? member.nick : member.username) + " が " + oldChannel.name + " から " + newChannel.name + " に移動しました。");
  }
});

bot.connect();


//command

const { Client, Collection, GatewayIntentBits } = require('discord.js');
// const { token } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
	console.log(`${client.user.tag}でログインしました。`);
});

client.login(process.env.TOKEN);

client.commands = new Collection();

const commandsPath = path.join(__dirname, './app/normal/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`${filePath} に必要な "data" か "execute" がありません。`);
	}
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`${interaction.commandName} が見つかりません。`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
	}
});