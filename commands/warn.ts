import { CacheType, Client, CommandInteraction, GuildMember } from 'discord.js'
import 'dotenv/config'
import warnIssuer from '../warnIssuer'

export default async function (interaction: CommandInteraction<CacheType>, client: Client) {
	await interaction.deferReply({ ephemeral: true })

	const driver = interaction.options.getMentionable('kierowca')

	if (driver instanceof GuildMember && driver.roles.cache.has(process.env.DRIVER_ROLE!)) {
		warnIssuer(driver).then(reply => interaction.editReply(reply))
	} else interaction.editReply('Możesz ostrzec tylko kierowców jako użytkowników Discorda.')
}
