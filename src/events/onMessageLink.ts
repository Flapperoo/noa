import { Channel, EmbedBuilder } from "discord.js";
import { Discord, On } from "discordx";
import type {ArgsOf, Client} from "discordx";

@Discord()
export class onMessageLink {
	@On({ event: "messageCreate" })
	async onMessageLink([message]: ArgsOf<"messageCreate">, client: Client): Promise<void> {
		if(!message.content.includes("https://discord.com/channels/")) {
			return
		}		

		const idsInUrl = message.content.match(/https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/);
		if (idsInUrl == null) {
			return console.error("Failed to parse ids in message link url: " + message.content);
		}

		const channelId = idsInUrl[2];
		const messageId = idsInUrl[3];

		let linkChannel;
		try {
			linkChannel = await client.channels.fetch(channelId);
		} catch (error) {
			console.error(`unable to fetch channel: ${error}`);
			return
		}
		if (linkChannel == null) {
			return console.error("Channel returned null in fetching message link: " + message.content);
		}
		if (!linkChannel.isTextBased()) {
			return
		}

		let linkMessage;
		try {
			linkMessage = await linkChannel.messages.fetch(messageId);
		} catch (error) {
			console.error(`unable to fetch message: ${error}`);
			return
		}

		const messageLinkEmbed = new EmbedBuilder()
					.setColor("#94e2d5")
					.setAuthor({name: `${linkMessage.author.displayName} said...`, iconURL: linkMessage.author.avatarURL() ?? undefined, url: linkMessage.url })
					.setTimestamp(linkMessage.createdTimestamp);
		if (linkMessage.content != "") {
			messageLinkEmbed.setDescription(">>> " + linkMessage.content);
		}
		if (linkMessage.attachments.size != 0) {
			const firstAttachment = linkMessage.attachments.first();
			if ( firstAttachment != undefined) {
				messageLinkEmbed.setImage(firstAttachment.url)
			} 
			let value = "";
			linkMessage.attachments.forEach((k) => {
				value = value.concat(`[${k.name}](${k.url})\n`);
			});
			messageLinkEmbed.addFields({name: "Attachments:", value: value});				
		}

		try {
			await message.channel.send({embeds: [messageLinkEmbed]});
			await message.react("✅");
		} catch (error) {
			console.error(`unable to send embed: ${error}`);
			return
		}		
	}
}