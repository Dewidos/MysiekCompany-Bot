import { CacheType, Client, CommandInteraction, GuildMember } from 'discord.js'
import 'dotenv/config'
import warnIssuer from '../warnIssuer'

export default async function (interaction: CommandInteraction<CacheType>, client: Client) {
	await interaction.deferReply({ ephemeral: true })

	const driver = interaction.options.getMentionable('kierowca')

	if (interaction.guild === null) return

	interaction.guild.members
		.fetch()
		.then(guildMembers => {
			return guildMembers.get(interaction.user.id)
		})
		.then(async envoker => {
			if (envoker === undefined) return

			if (!envoker.roles.cache.has(process.env.DISPATCHER_ROLE!)) {
				await interaction.editReply('Nie jesteś dyspozytorem, więc nie możesz zarządzać ostrzeżeniami.')
				return
			}

			if (driver instanceof GuildMember && driver.roles.cache.has(process.env.DRIVER_ROLE!)) {
				warnIssuer(driver).then(reply => interaction.editReply(reply))
			} else interaction.editReply('Możesz ostrzec tylko kierowców jako użytkowników Discorda.')
		})
		.catch(console.error)
}
