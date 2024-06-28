import { Channel, EmbedBuilder, Message, TextBasedChannel } from "discord.js";
import { Discord, On } from "discordx";
import type {ArgsOf, Client} from "discordx";

const MODULE_NAME = 'onMessageLink';

@Discord()
export class onMessageLink {
	@On({ event: "messageCreate" })
	async onMessageLink([message]: ArgsOf<"messageCreate">, client: Client): Promise<void> {
		if(!message.content.includes("https://discord.com/channels/")) {
			return
		}		

		console.log(`[${MODULE_NAME}] received messageCreate event with message link`);
		const idsInUrl = message.content.match(/https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/);
		if (!idsInUrl) {
			return console.error(`[${MODULE_NAME}] failed to parse ids in message link url: ${message.content}`);
		}

		const channelId = idsInUrl[2];
		const messageId = idsInUrl[3];

		const linkChannel = await fetchChannel(client, channelId);
		if (!linkChannel) {
			console.error(`[${MODULE_NAME}] channel returned null`);
			return
		}
		if (!linkChannel.isTextBased()) {
			return
		}

		const linkMessage = await fetchMessage(linkChannel, messageId);
		if (!linkMessage) {
			console.error(`[${MODULE_NAME}] message returned null`);
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
			if (firstAttachment) {
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
			console.error(`[${MODULE_NAME}] unable to send embed: ${error}`);
			return
		}		
	}
}

async function fetchChannel(client: Client, channelId: string): Promise<Channel | null> {
	try {
		return await client.channels.fetch(channelId);
	} catch (error) {
		console.error(`[${MODULE_NAME}] unable to fetch channel: ${error}`);
		return null
	}
}

async function fetchMessage(channel: TextBasedChannel, messageId: string): Promise<Message<boolean> | null> {
	try {
		return await channel.messages.fetch(messageId);
	} catch (error) {
		console.error(`[${MODULE_NAME}] unable to fetch message: ${error}`);
		return null
	}
}