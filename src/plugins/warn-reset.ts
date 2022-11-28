import { DiscordPlugin } from "../types/plugin";
import schedule from "node-schedule";
import Warn from "../models/Warn";
import CHANNELS from "../constants/channels";
import { Colors, TextChannel } from "discord.js";
import APP from "../constants/main";

const WarnReset: DiscordPlugin = (client) => {
  // each 1st of the month, reset the warn count of each user
  schedule.scheduleJob("0 0 1 * *", async () => {
    // delete all messages in the warn channel
    const warnChannel = client.channels.cache.get(
      CHANNELS.ONRUNTIME.TEAM.INFORMATION.WARN
    ) as TextChannel;

    const messages = await warnChannel.messages.fetch();
    // dont use forEach because it's async and we need to wait for the result, so use map
    await Promise.all(
      messages.map(async (message) => {
        await message.delete();
      })
    );

    await Warn.deleteMany({});

    const warnEmbed = {
      color: Colors.Red,
      title: "Warn (Beta)",
      description: "Les avertissements ont été réinitialisés pour ce mois-ci.",
      footer: {
        text: APP.NAME,
        icon_url: APP.LOGO,
      },
    };

    await warnChannel.send({ embeds: [warnEmbed] });
  });
};

export default WarnReset;
