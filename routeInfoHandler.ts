import { Message } from 'discord.js'
import warnIssuer from './warnIssuer'
import axios from 'axios'
import { JSDOM } from 'jsdom'
import 'dotenv/config'

export default async function (message: Message<boolean>) {
	const content = message.content.toLocaleLowerCase()

	message.guild?.members
		.fetch()
		.then(members => {
			const URLmatchArray = content.match(/(https?):\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?/gi)

			const URL = URLmatchArray?.length === 1 ? URLmatchArray[0] : undefined

			if (URL === undefined) return

			axios
				.get(URL)
				.then(response => {
					const trucksBookWebsite = new JSDOM(response.data)

					const deliverySourceInfo = trucksBookWebsite.window.document.querySelector(
						'body > section > div.main > div.wrapper > div:nth-child(1) > div > div.float-right > span.badge.badge-md.progress-bar-striped.badge-primary'
					)

					if (deliverySourceInfo === null || deliverySourceInfo.innerHTML.toLocaleLowerCase() !== 'dispatch') {
						message.guild?.channels
							.fetch(process.env.ANNOUNCEMENTS_CHANNEL!)
							.then(async channel => {
								if (!channel?.isText()) return

								const driverCandidates = members.filter(
									member => member.displayName.toLocaleLowerCase() === message.author.username.toLocaleLowerCase()
								)

								if (driverCandidates.size !== 1) {
									message.guild?.channels
										.fetch(process.env.BOT_INFO_CHANNEL!)
										.then(async channel => {
											if (!channel?.isText()) return

											await channel.send(
												`**Nie umiem znaleźć kierowcy o danym nicku!**\nNick z TrucksBook: ${message.author.username}\nLink do trasy: ${URL}\n*Osoba ta przejechała trasę nie pochodzącą z Dyspozytorni. Sprawdźcie jej przypadek i w razie potrzeby pouczcie ją o tym.*`
											)
										})
										.catch(console.error)

									return
								}

								await channel.send(
									`${driverCandidates
										.first()
										?.toString()}\nZaliczyłeś właśnie trasę nie pochodzącą od jednego z naszych Dyspozytorów. Nie możesz wykonywać zleceń pochodzących z innego źródła niż z Dyspozytorni naszej firmy.`
								)
							})
							.catch(console.error)
					}

					const infoTable = trucksBookWebsite.window.document.querySelector(
						'body > section > div.main > div.wrapper > div:nth-child(2) > div:nth-child(1) > div > div.card-body.p-0 > table > tbody'
					)

					if (infoTable instanceof trucksBookWebsite.window.HTMLTableSectionElement) {
						const rows = infoTable.getElementsByTagName('tr')
						let plannedDistanceData, acceptedDistanceData

						for (let i = 0; i < rows.length; i++) {
							const row = rows.item(i)
							const cols = row?.getElementsByTagName('td')

							if (cols?.length !== 2) continue

							const rowHeader = cols
								?.item(0)
								?.innerHTML.replace(/<.*?>(.*)<\/.*?\>/g, '')
								.replace(/^\s+|\s+$|\s+(?=\s)/g, '')

							switch (rowHeader) {
								case 'Damage':
									let damagePercent = parseInt(
										cols
											.item(1)
											?.innerHTML.replace(/^\s+|\s+$|\s+(?=\s)/g, '')
											.replace(/([^0-9])+/g, '')!
									)
									if (isNaN(damagePercent)) break

									if (damagePercent >= 10) {
										message.guild?.channels
											.fetch(process.env.ANNOUNCEMENTS_CHANNEL!)
											.then(async channel => {
												if (!channel?.isText()) return

												const driverCandidates = members.filter(
													member =>
														member.displayName.toLocaleLowerCase() === message.author.username.toLocaleLowerCase()
												)

												if (driverCandidates.size !== 1) {
													message.guild?.channels
														.fetch(process.env.BOT_INFO_CHANNEL!)
														.then(async channel => {
															if (!channel?.isText()) return

															await channel.send(
																`**Nie umiem znaleźć kierowcy o danym nicku!**\nNick z TrucksBook: ${message.author.username}\nLink do trasy: ${URL}\n*Osoba ta uszkodziła ładunek w ${damagePercent} procentach. Sprawdźcie jej przypadek i w razie potrzeby poproście ją o napisanie wyjaśnienia.*`
															)
														})
														.catch(console.error)

													return
												}

												await channel.send(
													`${driverCandidates
														.first()
														?.toString()}\nTwój ładunek dojechał uszkodzony w **${damagePercent} procentach**. Są to na tyle duże uszkodzenia, że musisz się z nich wytłumaczyć na kanale *inne-dokumenty*.`
												)
											})
											.catch(console.error)
									}
									break
								case 'Planned Distance':
									plannedDistanceData = parseInt(
										cols
											.item(1)
											?.innerHTML.replace(/^\s+|\s+$|\s+(?=\s)/g, '')
											.replace(/([^0-9])+/g, '')!
									)
									if (isNaN(plannedDistanceData)) {
										plannedDistanceData = undefined
										break
									}
									break
								case 'Accepted Distance':
									acceptedDistanceData = parseInt(
										cols
											.item(1)
											?.innerHTML.replace(/^\s+|\s+$|\s+(?=\s)/g, '')
											.replace(/([^0-9])+/g, '')!
									)
									if (isNaN(acceptedDistanceData)) {
										acceptedDistanceData = undefined
										break
									}
									break
								case 'Average Consumption':
									let averageFuelConsumption = parseFloat(
										cols
											.item(1)
											?.innerHTML.replace(/^\s+|\s+$|\s+(?=\s)/g, '')
											.split('/')[0]
											.replace(/([^0-9.,])+/g, '')!
									)

									if (isNaN(averageFuelConsumption)) break

									if (averageFuelConsumption > 50) {
										message.guild?.channels
											.fetch(process.env.ANNOUNCEMENTS_CHANNEL!)
											.then(async channel => {
												if (!channel?.isText()) return

												const driverCandidates = members.filter(
													member =>
														member.displayName.toLocaleLowerCase() === message.author.username.toLocaleLowerCase()
												)

												if (driverCandidates.size !== 1) {
													message.guild?.channels
														.fetch(process.env.BOT_INFO_CHANNEL!)
														.then(async channel => {
															if (!channel?.isText()) return

															await channel.send(
																`**Nie umiem znaleźć kierowcy o danym nicku!**\nNick z TrucksBook: ${message.author.username}\nLink do trasy: ${URL}\n*Osoba ta osiągneła zbyt wysokie średnie spalanie. Sprawdźcie jej przypadek i w razie potrzeby poinformujcie ją o tym.*`
															)
														})
														.catch(console.error)

													return
												}

												await channel.send(
													`${driverCandidates
														.first()
														?.toString()}\nTwoje średnie spalanie jest zbyt wysokie. W tej firmie tolerujemy spalanie nie większe niż **50 l/100km**.`
												)
											})
											.catch(console.error)
									}
									break
							}
						}

						if (plannedDistanceData !== undefined && acceptedDistanceData !== undefined) {
							if (plannedDistanceData > acceptedDistanceData + 10) {
								message.guild?.channels
									.fetch(process.env.BOT_INFO_CHANNEL!)
									.then(async channel => {
										if (!channel?.isText()) return

										await channel.send(
											`**Podejrzenie użycia teleportu!**\nNick z TrucksBook: ${message.author.username}\nLink do trasy: ${URL}\n*Ta osoba przejechała mniejszy dystans niż się spodziewano. Sprawdźcie jej przypadek i w razie potrzeby wystawcie ostrzeżenie.*`
										)
									})
									.catch(console.error)
							}
						}
					}
				})
				.catch(console.error)

			if (content.includes('wyścig')) {
				const warnCandidates = members.filter(
					member => member.displayName.toLocaleLowerCase() === message.author.username.toLocaleLowerCase()
				)

				message.guild?.channels
					.fetch(process.env.BOT_INFO_CHANNEL!)
					.then(async channel => {
						if (!channel?.isText()) return

						if (warnCandidates.size !== 1) {
							await channel.send(
								`**Nie umiem znaleźć kierowcy o danym nicku!**\nNick z TrucksBook: ${message.author.username}\nLink do trasy: ${URL}\n*Trasa tej osoby została zaliczona jako wyścig. Sprawdźcie jej przypadek i w razie potrzeby wystawcie ostrzeżenie.*`
							)
						} else {
							warnIssuer(warnCandidates.first()!)
								.then(async reply => {
									if (reply.includes('3'))
										await channel.send(
											`**Kierowca przekroczył dozwoloną liczbę ostrzeżeń!**\nNick z TrucksBook: ${message.author.username}\nLink do trasy: ${URL}\n*Trasa tej osoby została zaliczona jako wyścig. Wystawienie ostrzeżenia nie jest możliwe, ze względu na osiągnięcie ich maksymalnej ilości. Rozważcie wyrzucenie tej osoby z firmy.*`
										)
								})
								.catch(async () => {
									await channel.send(
										`**Nie umiem wystawić ostrzeżenia!**\nNick z TrucksBook: ${message.author.username}\nLink do trasy: ${URL}\n*Trasa tej osoby została zaliczona jako wyścig. Sprawdźcie jej przypadek i w razie potrzeby wystawcie ostrzeżenie.*`
									)
								})
						}
					})
					.catch(console.error)
			}
		})
		.catch(console.error)
}
