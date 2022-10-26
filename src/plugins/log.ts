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

  // handle when a guild member edit a message
  client.on("messageUpdate", (oldMessage, newMessage) => {
    Log.warn(
      oldMessage.guild?.name,
      `message edited by ${oldMessage.author?.username}#${oldMessage.author?.discriminator} in <#${oldMessage.channel.id}> "${oldMessage.cleanContent}" -> "${newMessage.cleanContent}"`
    );
  });
};

export default LogPlugin;
