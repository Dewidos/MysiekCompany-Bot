import { SlashCommandBuilder } from '@discordjs/builders'
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
import 'dotenv/config'

const commands = [
	new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Ostrzeż jakiegoś kierowcę!')
		.addMentionableOption(option =>
			option.setName('kierowca').setDescription('Kierowca, którego mam ostrzec.').setRequired(true)
		),
].map(command => command.toJSON())

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN)

rest
	.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error)
