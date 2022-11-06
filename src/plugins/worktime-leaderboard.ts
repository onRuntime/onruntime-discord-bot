import { ChannelType, Colors, TextChannel } from "discord.js";
import schedule from "node-schedule";
import { DiscordPlugin } from "../types/plugin";
import Worktime from "../models/Worktime";
import { endWorktime } from "./worktime";
import dayjs from "dayjs";
import APP from "../constants/main";
import CHANNELS from "../constants/channels";

const WorktimeLeadboardPlugin: DiscordPlugin = (client) => {
  // every sunday at midday, send a leaderboard in CHANNELS.ONRUNTIME.TEAM.LEADERBOARD
  schedule.scheduleJob("0 12 * * 0", async () => {
    // schedule.scheduleJob("* * * * *", async () => { // <-- for testing
    // end everyone worktime
    const inProgressWorktimes = await Worktime.find({
      endAt: null,
    });

    inProgressWorktimes.forEach(async (worktime) => {
      await endWorktime(client, worktime.userId);
    });

    // get all worktimes
    const worktimes = await Worktime.find();

    // create a map with the total worktime of each user
    const worktimeMap = new Map<string, number>();
    worktimes.forEach((worktime) => {
      const totalWorktime = worktimeMap.get(worktime.userId) || 0;
      worktimeMap.set(
        worktime.userId,
        totalWorktime + dayjs(worktime.endAt).diff(dayjs(worktime.startAt))
      );
    });

    // sort the map by total worktime
    const sortedWorktimeMap = new Map(
      [...worktimeMap.entries()].sort((a, b) => b[1] - a[1])
    );

    // create the leaderboard embed
    const leaderboardEmbed = {
      color: Colors.White,
      title: "Leaderboard (Beta)",
      description:
        `Voici le classement des membres de l'équipe pour la semaine du ${dayjs()
          .startOf("week")
          .format("DD/MM/YYYY")} au ${dayjs()
          .endOf("week")
          .format("DD/MM/YYYY")}\n\n` +
        Array.from(sortedWorktimeMap.entries())
          .map(([userId, totalWorktime], index) => {
            const user = client.users.cache.get(userId);
            return `${index + 1}. ${Math.floor(
              totalWorktime / 1000 / 60 / 60
            )}h ${Math.floor((totalWorktime / 1000 / 60) % 60)}min - **${
              user ? user.username : "Utilisateur inconnu"
            }**`;
          })
          .join("\n"),

      footer: {
        text: APP.NAME,
        icon_url: APP.LOGO,
      },
    };

    // send the leaderboard embed to CHANNELS.ONRUNTIME.TEAM.LEADERBOARD
    const channel = client.channels.cache.get(
      CHANNELS.ONRUNTIME.TEAM.LEADERBOARD
    );

    // if channel is guildtext channel
    if (channel && channel.type === ChannelType.GuildText) {
      const textChannel = channel as TextChannel;

      // send the leaderboard embed
      textChannel.send({ embeds: [leaderboardEmbed] });
    }

    // remove all worktimes from the database
    await Worktime.deleteMany({});
  });
};

export default WorktimeLeadboardPlugin;
