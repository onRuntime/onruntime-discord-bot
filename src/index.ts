import dixt from "dixt";
import dixtPluginLogs from "dixt-plugin-logs";
import dixtPluginAffix from "dixt-plugin-affix";
import dixtPluginPresence from "dixt-plugin-presence";
import dixtPluginReact from "dixt-plugin-react";
import dixtPluginTwitch from "dixt-plugin-twitch";
import dixtPluginPresenceOptions from "./options/presence";
import dixtPluginReactOptions from "./options/react";
import dixtPluginTwitchOptions from "./options/twitch";
import dixtPluginAffixOptions from "./options/affix";

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
    ],
  });

  await instance.start();
};

main();
