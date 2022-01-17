import { Client, Intents } from 'discord.js'
import 'dotenv/config'

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
})

client.login(process.env.TOKEN)
