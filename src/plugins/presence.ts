import { ActivityType } from "discord.js";
import APP from "../constants/main";
import { DiscordPlugin } from "../types/plugin";

const PresencePlugin: DiscordPlugin = async (client) => {
  client.on("ready", () => {
    client.user?.setPresence({
      activities: [
        {
          name: APP.URL,
          type: ActivityType.Watching,
        },
      ],
    });
  });
};

export default PresencePlugin;
