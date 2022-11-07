import { Events, REST, Routes } from "discord.js";
import DiscordApplication from "../services/discord";
import { ClientWithCommands } from "../types/command";
import { DiscordPlugin } from "../types/plugin";
import Log from "../utils/log";

const deployCommands = async (client: ClientWithCommands) => {
  const rest = new REST({ version: "10" }).setToken(
    DiscordApplication.bot.token
  );

  try {
    Log.event(
      `started refreshing ${client.commands?.size} application (/) commands.`
    );

    const data: any = await rest.put(
      Routes.applicationCommands(DiscordApplication.id),
      {
        body: client.commands?.map((command) => (command as any).data.toJSON()),
      }
    );

    Log.ready(`successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    Log.error(error);
  }
};

const CommandsPlugin: DiscordPlugin = async (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands?.get(interaction.commandName);

    if (!command) return;

    try {
      await (command as any).execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  });

  await deployCommands(client);
};

export default CommandsPlugin;
