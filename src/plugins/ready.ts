import { DiscordPlugin } from "../types/plugin";
import Log from "../utils/log";

const ReadyPlugin: DiscordPlugin = (client) => {
  client.on("ready", () => {
    Log.ready("discord client ready");
    // log guilds where the client is present
    client.guilds.cache.forEach((guild) => {
      Log.info(guild.name, "loaded successfully");
    });
  });
};

export default ReadyPlugin;