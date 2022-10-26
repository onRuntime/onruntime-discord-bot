import { DiscordPlugin } from "../types/plugin";
import Log from "../utils/log";

const LogPlugin: DiscordPlugin = (client) => {
  // handle when a guild member delete a message
  client.on("messageDelete", (message) => {
    Log.warn(
      message.guild?.name,
      `message deleted by ${message.author?.username}#${message.author?.discriminator} in <#${message.channel.id}> "${message.cleanContent}"`
    );
  });
};

export default LogPlugin;
