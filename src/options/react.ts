import { DixtPluginReactOptions } from "dixt-plugin-react";
import CHANNELS from "../constants/channels";

const dixtPluginReactOptions: DixtPluginReactOptions = {
  channels: [
    {
      id: CHANNELS.ONRUNTIME.TEAM.INFORMATION.IMPORTANT,
      emoji: "✅",
    },
    {
      id: CHANNELS.TONIGHTPASS.PRIVATE.IMPORTANT,
      emoji: "✅",
    },
    {
      id: CHANNELS.ONRUNTIME.TEAM.INFORMATION.IMPORTANT,
      emoji: "❌",
      matchs: ["réunion"],
    },
    {
      id: CHANNELS.TONIGHTPASS.PRIVATE.IMPORTANT,
      emoji: "❌",
      matchs: ["réunion"],
    },
    {
      id: CHANNELS.ONRUNTIME.TEAM.INFORMATION.LEADERBOARD,
      emoji: "👏",
    },
  ],
};

export default dixtPluginReactOptions;
