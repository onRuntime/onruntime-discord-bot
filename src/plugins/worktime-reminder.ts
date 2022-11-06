import schedule from "node-schedule";
import CHANNELS from "../constants/channels";
import { DiscordPlugin } from "../types/plugin";
import Log from "../utils/log";
import Worktime from "../models/Worktime";
import { endWorktime, getMembersInWorkVoiceChannel } from "./worktime";
import ROLES from "../constants/roles";

const WorktimeReminderPlugin: DiscordPlugin = (client) => {
  // forgot to start reminder
  // every 10 minutes send a message to members which are in voice channel but doesn't started their worktime
  schedule.scheduleJob("*/10 * * * *", async () => {
    const members = await getMembersInWorkVoiceChannel(client);
    // dont use forEach because it's async and we need to wait for the result, so use map
    await Promise.all(
      members.map(async (member) => {
        // check if the member has role ROLES.TONIGHTPASS.TEAM or ROLES.ONRUNTIME.TEAM
        if (
          member.roles.cache.has(ROLES.TONIGHTPASS.TEAM) ||
          member.roles.cache.has(ROLES.ONRUNTIME.TEAM)
        ) {
          const worktime = await Worktime.findOne({
            userId: member.user.id,
            endAt: null,
          });
          if (!worktime) {
            await member.send(
              `❌ - Vous semblez avoir oublié de pointer votre arrivée aujourd'hui (<#${CHANNELS.ONRUNTIME.TEAM.WORKTIME}>).`
            );
            Log.info(
              `Sent reminder to ${member.user.username}#${member.user.discriminator} for not starting worktime`
            );
          }
        }
      })
    );
  });

  // forgot to end reminder
  // every 10 minutes end worktime of members which are not in voicechannel but started their worktime
  schedule.scheduleJob("*/10 * * * *", async () => {
    const members = await getMembersInWorkVoiceChannel(client);
    const membersId = members.map((member) => member.user.id);
    const worktimes = await Worktime.find({
      endAt: null,
    });
    // dont use forEach because it's async and we need to wait for the result, so use map
    await Promise.all(
      worktimes.map(async (worktime) => {
        if (!membersId.includes(worktime.userId)) {
          await endWorktime(client, worktime.userId);
        }
      })
    );
  });
};

export default WorktimeReminderPlugin;
