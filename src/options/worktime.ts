import { DixtPluginWorktimeOptions } from "dixt-plugin-worktime";

import CHANNELS from "../constants/channels";
import ROLES from "../constants/roles";

const dixtPluginWorktimeOptions: DixtPluginWorktimeOptions = {
  channels: {
    main: [
      CHANNELS.ONRUNTIME.TEAM.INFORMATION.WORKTIME,
      CHANNELS.TONIGHTPASS.PRIVATE.WORKTIME,
    ],
    leaderboard: CHANNELS.ONRUNTIME.TEAM.INFORMATION.LEADERBOARD,
    workChannelNames: [
      "Work",
      "Meeting",
      "ᴀᴅᴍɪɴ",
      "ʟᴇᴀᴅ",
      "ᴅᴇᴠ",
      "ᴅᴇsɪɢɴ",
      "ʙᴜsɪɴᴇss",
      "ᴄᴏᴍ",
      "ɢᴇɴᴇʀᴀʟ",
      "ᴍᴇᴇᴛɪɴɢ",
    ],
  },
  quotas: {
    [ROLES.ONRUNTIME.EMPLOYEE]: 35,
    [ROLES.ONRUNTIME.MEMBER]: 6,
    [ROLES.ONRUNTIME.TRAINEE]: 35,
  },
  reports: {
    maximumDaysAbsent: 3,
  },
  tasks: {
    absentees: "0 12 * * 3-7",
  },
};

export default dixtPluginWorktimeOptions;
