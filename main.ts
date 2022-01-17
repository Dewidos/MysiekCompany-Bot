import Discord, { Client, Intents } from 'discord.js'
import 'dotenv/config'
import path from 'path'
import fs from 'fs'

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
})

client.once('ready', () => {
	console.log('Bot is online!')
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

client.login(process.env.TOKEN)
