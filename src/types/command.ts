import {
  CacheType,
  ChatInputCommandInteraction,
  Client,
  Collection,
  SlashCommandBuilder,
} from "discord.js";

// client with slash commands
export type ClientWithCommands = Client<boolean> & {
  commands?: Collection<string, SlashCommandBuilder>;
};

export type DiscordCommand = {
  data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>;
};
