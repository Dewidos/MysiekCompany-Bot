import { Client, Message } from 'discord.js'
import warnIssuer from './warnIssuer'

export default function (message: Message<boolean>) {
	const content = message.content.toLocaleLowerCase()

	if (content.includes('wyścig')) {
		message.guild?.members
			.fetch()
			.then(members => {
				const warnCandidates = members.filter(
					member => member.displayName.toLocaleLowerCase() === message.member?.displayName.toLocaleLowerCase()
				)

				message.guild?.channels
					.fetch(process.env.BOT_INFO_CHANNEL!)
					.then(async channel => {
						if (!channel?.isText()) return

						if (warnCandidates.size !== 1) {
							await channel.send(
								`**Nie umiem znaleźć kierowcy o danym nicku!**\nNick z TrucksBook: ${message.member?.displayName}\n*Trasa tej osoby została zaliczona jako wyścig. Sprawdźcie jej przypadek i w razie potrzeby wystawcie ostrzeżenie.*`
							)
						} else {
							warnIssuer(warnCandidates.first()!)
								.then(async reply => {
									if (reply.includes('3'))
										await channel.send(
											`**Kierowca przekroczył dozwoloną liczbę ostrzeżeń!**\nNick z TrucksBook: ${message.member?.displayName}\n*Trasa tej osoby została zaliczona jako wyścig. Wystawienie ostrzeżenia nie jest możliwe, ze względu na osiągnięcie ich maksymalnej ilości. Rozważcie wyrzucenie tej osoby z firmy.*`
										)
								})
								.catch(async () => {
									await channel.send(
										`**Nie umiem wystawić ostrzeżenia!**\nNick z TrucksBook: ${message.member?.displayName}\n*Trasa tej osoby została zaliczona jako wyścig. Sprawdźcie jej przypadek i w razie potrzeby wystawcie ostrzeżenie.*`
									)
								})
						}
					})
					.catch(console.error)
			})
			.catch(console.error)
	}
}
