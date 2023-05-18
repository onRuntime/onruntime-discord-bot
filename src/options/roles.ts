import { DixtPluginRolesOptions } from "dixt-plugin-roles";

import CHANNELS from "../constants/channels";
import ROLES from "../constants/roles";

const dixtPluginTwitchOptions: DixtPluginRolesOptions = {
  channels: [
    {
      id: CHANNELS.TONIGHTPASS.INFORMATIONS.ROLES,
      name: "Assign yourself a role!",
      description: "React to this message to assign yourself a role!",
      roles: [
        {
          id: ROLES.TONIGHTPASS.BETA_TESTER,
          emoji: "🧪",
          description:
            "You would like to join our Beta test program, and receive instructions on how to do so, give us feedback and help us develop the application!",
        },
      ],
    },
  ],
};

export default dixtPluginTwitchOptions;
