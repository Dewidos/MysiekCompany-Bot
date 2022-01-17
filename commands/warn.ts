import { CacheType, Client, CommandInteraction, GuildMember } from 'discord.js'

export default async function (interaction: CommandInteraction<CacheType>, client: Client) {
	await interaction.deferReply({ ephemeral: true })

	const driver = interaction.options.getMentionable('kierowca')

	// 907659694078824478 - id kierowcy na serwie myśka

	if (driver instanceof GuildMember && driver.roles.cache.has('932662619217739859'))
		interaction.guild?.channels
			.fetch('932653802199343104')
			.then(async channel => {
				if (!channel?.isText()) return

				const previousWarnMessage = channel.messages.cache.find(message => message.content === driver?.toString())

				let editedReply = false

				if (previousWarnMessage === undefined) {
					const warnMessage = await channel.send(driver?.toString()!)

					warnMessage.react('🟢')
				} else {
					const reactions = previousWarnMessage.reactions.cache.filter(
						reaction =>
							['🟢', '🟠', '🔴'].findIndex(possibleReaction => possibleReaction === reaction.emoji.toString()) !== -1
					)

					switch (reactions.size) {
						case 0:
							previousWarnMessage.react('🟢')
							break
						case 1:
							previousWarnMessage.react('🟠')
							break
						case 2:
							previousWarnMessage.react('🔴')
							editedReply = true
							await interaction.editReply(
								'Kierowca został ostrzeżony.\n*Ten kierowca ma już 3 ostrzeżenia. Rozważ wyrzucenie go z firmy.*'
							)
							break
						default:
							editedReply = true
							await interaction.editReply(
								'Kierowca nie został ostrzeżony, ponieważ ma na koncie już 3 ostrzeżenia. Rozważ wyrzucenie go z firmy.'
							)
							break
					}
				}

				if (!editedReply) interaction.editReply('Kierowca został ostrzeżony.')
			})
			.catch(console.error)
	else interaction.editReply('Możesz ostrzec tylko kierowców jako użytkowników Discorda.')
}
