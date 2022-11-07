import { SlashCommandBuilder } from "discord.js";
import { DiscordCommand } from "../types/command";

const PingCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};

export default PingCommand;
