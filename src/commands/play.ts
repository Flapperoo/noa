import { ApplicationCommandOptionType, CommandInteraction, GuildMember } from "discord.js";
import { Client, Discord, Slash, SlashOption } from "discordx";
import { audioManager } from "../main";

@Discord()
export class Play {
  @Slash({ description: "Add a song to the queue" })
  async play(
    @SlashOption({
      description: "URL",
      name: "url",
      required: true,
      type: ApplicationCommandOptionType.String
    })
    url: string,
    interaction: CommandInteraction,
    client: Client
  ): Promise<void> {
    if (!interaction.guildId) return;
    if (!(interaction.member instanceof GuildMember)) return;
    if (!interaction.member.voice.channelId) {
      await interaction.reply("You must be in a voice channel");
      return;
    };
    const queue = audioManager.queue(interaction.guildId);

    try {
      queue.join({
        channelId: interaction.member.voice.channelId,
      });
      queue.addTrack({
        url: url
      });
    } catch (error) {
      await interaction.reply("An error occurred");
      console.error(error);
    }
  }
}