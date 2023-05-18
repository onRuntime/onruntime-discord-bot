import { DixtPluginRolesOptions } from "dixt-plugin-roles";

import CHANNELS from "../constants/channels";
import ROLES from "../constants/roles";

const dixtPluginRolesOptions: DixtPluginRolesOptions = {
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
          message: `Welcome to our Beta test program!\n\nIf you use iOS:\n- [Follow the instructions by clicking here](https://testflight.apple.com/join/ZtOgXCpb)\n- Give us your feedback in <#${CHANNELS.TONIGHTPASS.APPS.IOS_BETA}>\n\nIf you are using Android:\n*It's not available yet but it's coming soon!*`,
        },
      ],
    },
  ],
};

export default dixtPluginRolesOptions;
