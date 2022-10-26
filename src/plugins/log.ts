import { TextChannel } from "discord.js";
import { DiscordPlugin } from "../types/plugin";
import Log from "../utils/log";

const LogPlugin: DiscordPlugin = (client) => {
  // handle when a guild member delete a message
  client.on("messageDelete", (message) => {
    if ((message.channel as TextChannel)?.name.startsWith("access")) return;
    Log.warn(
      `**${message.guild?.name}**`,
      `message deleted by **${message.author?.username}#${message.author?.discriminator}** in <#${message.channel.id}> "${message.cleanContent}"`
    );
  });

  // handle when a guild member edit a message
  client.on("messageUpdate", (oldMessage, newMessage) => {
    if ((oldMessage.channel as TextChannel)?.name.startsWith("access")) return;
    Log.warn(
      `**${oldMessage.guild?.name}**`,
      `message edited by **${oldMessage.author?.username}#${oldMessage.author?.discriminator}** in <#${oldMessage.channel.id}> "${oldMessage.cleanContent}" ➜ "${newMessage.cleanContent}"`
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

  // handle when someone change the role of someone
  client.on("guildMemberUpdate", (oldMember, newMember) => {
    if (oldMember.roles.cache.size === newMember.roles.cache.size) return;
    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
      const role = oldMember.roles.cache.find(
        (role) => !newMember.roles.cache.has(role.id)
      );
      Log.info(
        `**${newMember.guild.name}**`,
        `member **${newMember.user.username}#${newMember.user.discriminator}** lost role **${role?.name}**`
      );
    } else {
      const role = newMember.roles.cache.find(
        (role) => !oldMember.roles.cache.has(role.id)
      );
      Log.info(
        `**${newMember.guild.name}**`,
        `member **${newMember.user.username}#${newMember.user.discriminator}** gained role **${role?.name}**`
      );
    }
  });
};

export default LogPlugin;
