import dixt from "dixt";
import dixtPluginAffix from "dixt-plugin-affix";
import dixtPluginLogs from "dixt-plugin-logs";
import dixtPluginPresence from "dixt-plugin-presence";
import dixtPluginReact from "dixt-plugin-react";
import dixtPluginReports from "dixt-plugin-reports";
import dixtPluginRoles from "dixt-plugin-roles";
import dixtPluginTwitch from "dixt-plugin-twitch";
import dixtPluginWorktime from "dixt-plugin-worktime";

import dixtPluginAffixOptions from "./options/affix";
import dixtPluginPresenceOptions from "./options/presence";
import dixtPluginReactOptions from "./options/react";
import dixtPluginReportsOptions from "./options/reports";
import dixtPluginRolesOptions from "./options/roles";
import dixtPluginTwitchOptions from "./options/twitch";
import dixtPluginWorktimeOptions from "./options/worktime";

const main = async () => {
  const instance = new dixt({
    application: {
      name: "onRuntime",
      logo: "https://cdn.discordapp.com/avatars/785867610675216434/8b2d8af13fc8bd310503b17031bd1564.webp",
    },
    plugins: [
      dixtPluginLogs,
      [dixtPluginAffix, dixtPluginAffixOptions],
      [dixtPluginReact, dixtPluginReactOptions],
      [dixtPluginPresence, dixtPluginPresenceOptions],
      [dixtPluginTwitch, dixtPluginTwitchOptions],
      [dixtPluginWorktime, dixtPluginWorktimeOptions],
      [dixtPluginRoles, dixtPluginRolesOptions],
      [dixtPluginReports, dixtPluginReportsOptions],
    ],
  });

  await instance.start();
};

main();
