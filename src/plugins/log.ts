import { DiscordPlugin } from "../types/plugin";
import Log from "../utils/log";

const LogPlugin: DiscordPlugin = (client) => {
  // handle when a guild member delete a message
  client.on("messageDelete", (message) => {
    Log.warn(
      `**${message.guild?.name}**`,
      `message deleted by **${message.author?.username}#${message.author?.discriminator}** in <#${message.channel.id}> "${message.cleanContent}"`
    );
  });

  // handle when a guild member edit a message
  client.on("messageUpdate", (oldMessage, newMessage) => {
    Log.warn(
      `**${oldMessage.guild?.name}**`,
      `message edited by **${oldMessage.author?.username}#${oldMessage.author?.discriminator}** in <#${oldMessage.channel.id}> "${oldMessage.cleanContent}" -> "${newMessage.cleanContent}"`
    );
  });

  // handle when a guild member join the server
  client.on("guildMemberAdd", (member) => {
    Log.info(
      `**${member.guild.name}**`,
      `member joined **${member.user.username}#${member.user.discriminator}**`
    );
  });

  // handle when a guild member leave the server
  client.on("guildMemberRemove", (member) => {
    Log.info(
      `**${member.guild.name}**`,
      `member left **${member.user.username}#${member.user.discriminator}**`
    );
  });

  // handle when a member join a voice channel
  client.on("voiceStateUpdate", (oldState, newState) => {
    if (oldState.channelId === newState.channelId) return;
    if (oldState.channelId === null) {
      Log.info(
        `**${newState.guild.name}**`,
        `member **${newState.member?.user.username}#${newState.member?.user.discriminator}** joined voice channel **${newState.channel?.name}**`
      );
    } else if (newState.channelId === null) {
      Log.info(
        `**${oldState.guild.name}**`,
        `member **${oldState.member?.user.username}#${oldState.member?.user.discriminator}** left voice channel **${oldState.channel?.name}**`
      );
    } else {
      Log.info(
        `**${newState.guild.name}**`,
        `member **${newState.member?.user.username}#${newState.member?.user.discriminator}** switched voice channel from **${oldState.channel?.name}** to **${newState.channel?.name}**`
      );
    }
  });
};

export default LogPlugin;
