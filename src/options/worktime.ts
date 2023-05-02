import { DixtPluginWorktimeOptions } from "dixt-plugin-worktime";

import CHANNELS from "../constants/channels";
import ROLES from "../constants/roles";

const dixtPluginWorktimeOptions: DixtPluginWorktimeOptions = {
  channels: {
    main: [CHANNELS.ONRUNTIME.TEAM.INFORMATION.WORKTIME],
    leaderboard: CHANNELS.ONRUNTIME.TEAM.INFORMATION.LEADERBOARD,
    workChannelNames: ["Work", "Meeting"],
  },
  quotas: {
    [ROLES.ONRUNTIME.EMPLOYEE]: 30,
    [ROLES.ONRUNTIME.MEMBER]: 6,
    [ROLES.ONRUNTIME.TRAINEE]: 20,
  },
};

export default dixtPluginWorktimeOptions;
