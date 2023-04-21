import { DixtPluginTwitchOptions } from "dixt-plugin-twitch";
import CHANNELS from "../constants/channels";
import ROLES from "../constants/roles";

const dixtPluginTwitchOptions: DixtPluginTwitchOptions = {
  channel: CHANNELS.ONRUNTIME.INFORMATION.LIVES,
  roles: [ROLES.ONRUNTIME.MEMBER],
};

export default dixtPluginTwitchOptions;
