import { ActivityType, Client } from "discord.js";
import { DiscordPlugin } from "../types/plugin";

const PresencePlugin: DiscordPlugin = (client: Client<boolean>) => {
  client.user?.setPresence({
    activities: [
      {
        name: "onruntime.com",
        type: ActivityType.Watching,
      },
    ],
  });
};

export default PresencePlugin;
