import { CacheType, Client, CommandInteraction, GuildMember } from 'discord.js'
import 'dotenv/config'

export default async function (interaction: CommandInteraction<CacheType>, client: Client) {
	await interaction.deferReply({ ephemeral: true })

	const driver = interaction.options.getMentionable('kierowca')
	const deleteAllWarns = interaction.options.getBoolean('wszystkie') === true ? true : false

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
				driver.guild?.channels
					.fetch(process.env.WARN_CHANNEL!)
					.then(async channel => {
						if (!channel?.isText()) return

						const previousWarnMessage = channel.messages.cache.find(message => message.content === driver?.toString())

						if (previousWarnMessage === undefined) {
							await interaction.editReply('Ta osoba nie posiada żadnych ostrzeżeń!')

							return
						}

						const greenCircle = previousWarnMessage.reactions.cache.get('🟢')
						const orangeCircle = previousWarnMessage.reactions.cache.get('🟠')
						const redCircle = previousWarnMessage.reactions.cache.get('🔴')

						let warnCount = 0

						if (greenCircle !== undefined) {
							warnCount++
							if (orangeCircle !== undefined) {
								warnCount++
								if (redCircle !== undefined) warnCount++
							}
						}

						if (warnCount < 1) {
							await interaction.editReply('Ta osoba nie posiada żadnych ostrzeżeń!')
							if (previousWarnMessage.deletable) await previousWarnMessage.delete()

							return
						}

						if (deleteAllWarns) {
							if (previousWarnMessage.deletable) await previousWarnMessage.delete()
							else {
								if (greenCircle !== undefined) await greenCircle.remove()
								if (orangeCircle !== undefined) await orangeCircle.remove()
								if (redCircle !== undefined) await redCircle.remove()
							}

							await interaction.editReply('Ostrzeżenia tego kierowcy zostały usunięte.')
						} else {
							switch (warnCount) {
								case 1:
									if (previousWarnMessage.deletable) await previousWarnMessage.delete()
									else if (greenCircle !== undefined) await greenCircle.remove()
									break
								case 2:
									if (orangeCircle !== undefined) await orangeCircle.remove()
									break
								case 3:
									if (redCircle !== undefined) await redCircle.remove()
									break
							}

							await interaction.editReply('Ostrzeżenie zostało usunięte.')
						}
					})
					.catch(console.error)
			} else interaction.editReply('Możesz ostrzec tylko kierowców jako użytkowników Discorda.')
		})
		.catch(console.error)
}
