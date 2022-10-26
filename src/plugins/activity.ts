import { ActivityType } from "discord.js";
import APP from "../constants/main";
import { DiscordPlugin } from "../types/plugin";

const ActivityPlugin: DiscordPlugin = (client) => {
  client.user?.setActivity(APP.URL, {
    type: ActivityType.Watching,
    url: APP.URL,
  });
};

export default ActivityPlugin;
