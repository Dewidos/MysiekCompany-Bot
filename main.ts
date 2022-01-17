import Discord, { Client, Intents, MessageSelectMenu } from 'discord.js'
import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import routeInfoHandler from './routeInfoHandler'

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MEMBERS,
	],
})

client.once('ready', () => {
	console.log('Bot is online!')

	client.guilds
		.fetch(process.env.GUILD_ID!)
		.then(guild => {
			guild.channels
				.fetch(process.env.WARN_CHANNEL!)
				.then(async channel => {
					if (!channel?.isText()) return

					await channel.messages.fetch({ limit: 100 })
				})
				.catch(console.error)
		})
		.catch(console.error)
})

client.on('interactionCreate', interaction => {
	if (!interaction.isCommand()) return

	const { commandName } = interaction

	const commandDir = './commands'
	const extension = path.extname(__filename)
	const files = fs.readdirSync(commandDir)

	const commandFile = files.find(file => file == `${commandName}${extension}`)

	if (commandFile === undefined) {
		interaction.reply('Nieznana komenda.')
		return
	}

	try {
		require(`${commandDir}/${commandFile}`).default(interaction, client)
	} catch (error) {
		console.error(error)
	}
})

client.on('messageCreate', message => {
	if (message.channel.id === process.env.ROUTE_INFO_CHANNEL) routeInfoHandler(message)
})

client.login(process.env.TOKEN)
