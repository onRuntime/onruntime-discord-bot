import { ActivityType } from "discord.js";
import { DixtPluginPresenceOptions } from "dixt-plugin-presence";

const dixtPluginPresenceOptions: DixtPluginPresenceOptions = {
  presences: [
    {
      activities: [
        {
          name: "onruntime.com",
          type: ActivityType.Watching,
        },
      ],
    },
    {
      activities: [
        {
          name: "tonightpass.com",
          type: ActivityType.Watching,
        },
      ],
    },
  ],
};

export default dixtPluginPresenceOptions;
