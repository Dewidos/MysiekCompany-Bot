import { GuildMember } from 'discord.js'
import 'dotenv/config'

export default async function (driver: GuildMember): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		driver.guild?.channels
			.fetch(process.env.WARN_CHANNEL!)
			.then(async channel => {
				if (!channel?.isText()) return

				const previousWarnMessage = channel.messages.cache.find(message => message.content === driver?.toString())

				let reply: string = ''
				let replyWasSet = false

				if (previousWarnMessage === undefined) {
					const warnMessage = await channel.send(driver?.toString()!)

					await warnMessage.react('🟢')
				} else {
					const reactions = previousWarnMessage.reactions.cache.filter(
						reaction =>
							['🟢', '🟠', '🔴'].findIndex(possibleReaction => possibleReaction === reaction.emoji.toString()) !== -1
					)

					switch (reactions.size) {
						case 0:
							await previousWarnMessage.react('🟢')
							break
						case 1:
							await previousWarnMessage.react('🟠')
							break
						case 2:
							await previousWarnMessage.react('🔴')
							replyWasSet = true
							reply = 'Kierowca został ostrzeżony.\n*Ten kierowca ma już 3 ostrzeżenia. Rozważ wyrzucenie go z firmy.*'
							break
						default:
							replyWasSet = true
							reply =
								'Kierowca nie został ostrzeżony, ponieważ ma na koncie już 3 ostrzeżenia. Rozważ wyrzucenie go z firmy.'
							break
					}
				}

				if (!replyWasSet) reply = 'Kierowca został ostrzeżony.'

				if (reply !== undefined) resolve(reply)
				else reject()
			})
			.catch(console.error)
	})
}
