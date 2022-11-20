import { Events } from "discord.js";
import CHANNELS from "../constants/channels";
import { DiscordPlugin } from "../types/plugin";

const AutoReactPlugin: DiscordPlugin = (client) => {
  client.on(Events.MessageCreate, (message) => {
    // check if Channel is CHANNELS.ONRUNTIME.TEAM.INFORMATION.IMPORTANT or CHANNELS.TONIGHTPASS.PRIVATE.IMPORTANT
    if (
      message.channel.id === CHANNELS.ONRUNTIME.TEAM.INFORMATION.IMPORTANT ||
      message.channel.id === CHANNELS.TONIGHTPASS.PRIVATE.IMPORTANT
    ) {
      // add reaction to message
      message.react("✅");

      // check if message contain "réunion"
      if (message.content.toLowerCase().includes("réunion")) {
        // add reaction to message
        message.react("❌");
      }
    }

    // check if Channel is CHANNELS.ONRUNTIME.TEAM.INFORMATION.LEADERBOARD
    if (
      message.channel.id === CHANNELS.ONRUNTIME.TEAM.INFORMATION.LEADERBOARD
    ) {
      // add reaction to message
      message.react("👏");
    }
  });
};

export default AutoReactPlugin;
