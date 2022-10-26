import { ChannelType, TextChannel } from "discord.js";
import CHANNELS from "../constants/channels";
import { DiscordPlugin } from "../types/plugin";

const WorktimePlugin: DiscordPlugin = async (client) => {
  // delete all message from CHANNELS.ONRUNTIME.TEAM.WORKTIME channel on startup, dont forget to check if it's a text channel
  const channel = await client.channels.cache.get(
    CHANNELS.ONRUNTIME.TEAM.WORKTIME
  );
  if (channel?.type === ChannelType.GuildText) {
    const textChannel = channel as TextChannel;
    const messages = await textChannel.messages.fetch();
    messages.forEach((message) => message.delete());
  }
};

export default WorktimePlugin;
