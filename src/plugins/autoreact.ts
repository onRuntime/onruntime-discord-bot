import { Events } from "discord.js";
import CHANNELS from "../constants/channels";
import { DiscordPlugin } from "../types/plugin";

const AutoReactPlugin: DiscordPlugin = (client) => {
  client.on(Events.MessageCreate, (message) => {
    // check if Channel is CHANNELS.ONRUNTIME.TEAM.IMPORTANT or CHANNELS.TONIGHTPASS.PRIVATE.IMPORTANT
    if (
      message.channel.id === CHANNELS.ONRUNTIME.TEAM.IMPORTANT ||
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
  });
};

export default AutoReactPlugin;
