import {
  ButtonStyle,
  ChannelType,
  Client,
  Collection,
  Colors,
  Events,
  GuildMember,
  TextChannel,
  User,
} from "discord.js";
import CHANNELS from "../constants/channels";
import APP from "../constants/main";
import { DiscordPlugin } from "../types/plugin";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Log from "../utils/log";
import Worktime from "../models/Worktime";
import ROLES from "../constants/roles";
import progressIndicator from "../utils/progressIndicator";
import QUOTAS from "../constants/quotas";

dayjs.extend(utc);
dayjs.extend(timezone);

const tz = "Europe/Paris";

export const isInWorkVoiceChannel = async (
  client: Client<boolean>,
  userId: string | undefined
) => {
  if (!userId) return false;
  // check all voice channels which a name that contain "work" from each guilds to see if a user with same user id is present
  // return true if the user is present in a voice channel
  // return false if the user is not present in a voice channel
  await client.guilds.fetch();
  const guilds = client.guilds.cache;
  // dont use forEach because it's async and we need to wait for the result, so use map
  const results = await Promise.all(
    guilds.map(async (guild) => {
      await guild.channels.fetch();
      const channels = guild.channels.cache;
      const workChannels = channels.filter(
        (channel) =>
          (channel.name.toLowerCase().includes("work") ||
            channel.name.toLowerCase().includes("meeting")) &&
          channel.type === ChannelType.GuildVoice
      );

      // dont use forEach because it's async and we need to wait for the result, so use map
      const results = await Promise.all(
        workChannels.map(async (channel) => {
          const members = channel.members as Collection<string, GuildMember>;
          const member = members.get(userId);
          if (member) return true;
          return false;
        })
      );

      return results.includes(true);
    })
  );

  return results.includes(true);
};

export const getMembersInWorkVoiceChannel = async (
  client: Client<boolean>
): Promise<GuildMember[]> => {
  await client.guilds.fetch();
  const guilds = client.guilds.cache;
  const results: GuildMember[] = [];
  // dont use forEach because it's async and we need to wait for the result, so use map
  await Promise.all(
    guilds.map(async (guild) => {
      await guild.channels.fetch();
      const channels = guild.channels.cache;
      const workChannels = channels.filter(
        (channel) =>
          (channel.name.toLowerCase().includes("work") ||
            channel.name.toLowerCase().includes("meeting")) &&
          channel.type === ChannelType.GuildVoice
      );

      // dont use forEach because it's async and we need to wait for the result, so use map
      await Promise.all(
        workChannels.map(async (channel) => {
          const members = channel.members as Collection<string, GuildMember>;
          // add each member to the results array and avoid "Property 'array' does not exist on type 'Collection<string, GuildMember>'
          // because we can't use forEach on a Collection
          members.map((member) => {
            results.push(member);
          });
        })
      );
    })
  );

  return results;
};

export const getTeamMembers = async (
  client: Client<boolean>
): Promise<GuildMember[]> => {
  await client.guilds.fetch();
  const guilds = client.guilds.cache;
  const results: GuildMember[] = [];
  // dont use forEach because it's async and we need to wait for the result, so use map
  await Promise.all(
    guilds.map(async (guild) => {
      // get guild members with role ROLES.TONIGHTPASS.TEAM or ROLES.ONRUNTIME.TEAM
      await guild.members.fetch();
      const members = guild.members.cache;
      const teamMembers = members.filter(
        (member) =>
          member.roles.cache.has(ROLES.TONIGHTPASS.TEAM) ||
          member.roles.cache.has(ROLES.ONRUNTIME.TEAM)
      );
      // add each member to the results array and avoid "Property 'array' does not exist on type 'Collection<string, GuildMember>'
      // because we can't use forEach on a Collection and avoid duplication
      teamMembers.map((member) => {
        if (!results.find((result) => result.user.id === member.user.id)) {
          results.push(member);
        }
      });
    })
  );

  return results;
};

/**
 * Check the user status at onRuntime by checking if he have the role ROLES.ONRUNTIME.TEAM and ROLES.ONRUNTIME.TRAINEE or ROLES.ONRUNTIME.MEMBER or ROLES.ONRUNTIME.EMPLOYEE, return a string with the role id or null
 */
export const getUserStatusId = async (client: Client, user: User) => {
  await client.guilds.fetch();
  const guilds = client.guilds.cache;
  let statusId: string | null = null;

  // dont use forEach because it's async and we need to wait for the result, so use map
  await Promise.all(
    guilds.map(async (guild) => {
      // get guild members with role ROLES.TONIGHTPASS.TEAM or ROLES.ONRUNTIME.TEAM
      await guild.members.fetch();
      const members = guild.members.cache;
      const member = members.find((member) => member.user.id === user.id);
      if (member) {
        if (member.roles.cache.has(ROLES.ONRUNTIME.TEAM)) {
          if (member.roles.cache.has(ROLES.ONRUNTIME.EMPLOYEE)) {
            statusId = ROLES.ONRUNTIME.EMPLOYEE;
          } else if (member.roles.cache.has(ROLES.ONRUNTIME.MEMBER)) {
            statusId = ROLES.ONRUNTIME.MEMBER;
          } else if (member.roles.cache.has(ROLES.ONRUNTIME.TRAINEE)) {
            statusId = ROLES.ONRUNTIME.TRAINEE;
          }
        }
      }
    })
  );

  return statusId;
};

export const startWorktime = async (
  client: Client,
  userId: string | undefined
) => {
  if (!userId) return;

  const worktime = await Worktime.findOne({
    userId: userId,
    endAt: null,
  });

  const user = await client.users.fetch(userId);

  if (worktime) {
    // if the user has already started his worktime, send a message to the user
    user.send(
      `❌ - Vous avez déjà commencé votre activité à ${dayjs(worktime.startAt)
        .tz(tz)
        .format("HH:mm")}`
    );
  } else {
    // add new Wortime with only the startAt
    await Worktime.create({
      startAt: new Date(),
      userId: userId,
    });

    user.send(
      `✅ - Votre prise d'activité a été validée à ${dayjs()
        .tz(tz)
        .format("HH:mm")}`
    );
    Log.info(
      `✅ - Prise d'activité validée à ${dayjs()
        .tz(tz)
        .format("HH:mm")} par **${user.username}#${user.discriminator}**`
    );
  }
};

export const endWorktime = async (
  client: Client,
  userId: string | undefined
) => {
  if (!userId) return;

  const worktime = await Worktime.findOne({
    userId: userId,
    endAt: null,
  });

  const user = await client.users.fetch(userId);

  if (worktime) {
    // if the user has already started his worktime, end it
    worktime.endAt = new Date();
    await worktime.save();

    // get all worktimes from the userId and tell him how many time he spent
    const worktimes = await Worktime.find({
      userId: userId,
    });

    let totalWorktime = 0;
    worktimes.forEach((worktime) => {
      if (worktime.startAt && worktime.endAt) {
        totalWorktime += worktime.endAt.getTime() - worktime.startAt.getTime();
      }
    });

    const statusId = await getUserStatusId(client, user);
    // convert totalWorktime to hours
    const totalWorktimeInHours = totalWorktime / 1000 / 60 / 60;
    // percentage of the totalWorktimeInHours compared to the quota
    const percentage = statusId
      ? (totalWorktimeInHours / QUOTAS[statusId]) * 100
      : 0;

    user.send(
      `✅ - Votre fin d'activité a été validée à ${dayjs()
        .tz(tz)
        .format("HH:mm")} - Vous avez passé ${Math.floor(
        totalWorktime / 1000 / 60 / 60
      )}h${Math.floor(
        (totalWorktime / 1000 / 60) % 60
      )}min à travailler cette semaine - ${
        // percentage of total work based on totalWorktime and QUOTAS[getUserStatus(user)],
        statusId
          ? progressIndicator(percentage)
          : "Vous n'avez pas de rôle d'employé, pensez à le demander."
      }`
    );
    Log.info(
      `✅ - Fin d'activité validée à ${dayjs().tz(tz).format("HH:mm")} par **${
        user.username
      }#${user.discriminator}** - ${Math.floor(
        totalWorktime / 1000 / 60 / 60
      )}h${Math.floor((totalWorktime / 1000 / 60) % 60)}min - ${
        // percentage of total work based on totalWorktime and QUOTAS[getUserStatus(user)],
        statusId
          ? progressIndicator(percentage)
          : "Vous n'avez pas de rôle d'employé, pensez à le demander."
      }`
    );

    return true;
  } else {
    // if the user has not started his worktime, send a message to the user
    user.send("❌ - Vous n'avez pas commencé votre activité aujourd'hui");

    return false;
  }
};

const WorktimePlugin: DiscordPlugin = (client) => {
  // delete all message from CHANNELS.ONRUNTIME.TEAM.INFORMATION.WORKTIME channel on startup, dont forget to check if it's a text channel
  client.on(Events.ClientReady, async () => {
    const channel = await client.channels.cache.get(
      CHANNELS.ONRUNTIME.TEAM.INFORMATION.WORKTIME
    );
    if (channel?.type === ChannelType.GuildText) {
      const textChannel = channel as TextChannel;
      const messages = await textChannel.messages.fetch();
      messages.forEach(async (message) => await message.delete());

      // worktime sert a pointé les heures des membres de l'équipe
      // appuyez sur le bouton Prise d'activité pour pointer votre arrivée
      // puis Fin d'activité pour pointer votre départ
      // veillez a bien vous connecter à un salon vocal pour que votre Prise d'activité soit bien prise en compte
      // send this message to CHANNELS.ONRUNTIME.TEAM.INFORMATION.WORKTIME channel as an embed message

      const instructionEmbed = {
        color: Colors.White,
        title: "Worktime (Beta)",
        description:
          "Pointage des heures des membres de l'équipe.\n\n" +
          "**Prise d'activité**\n" +
          "Appuyez sur le bouton **Prise d'activité** pour pointer votre arrivée.\n\n" +
          "**Fin d'activité**\n" +
          "Appuyez sur le bouton **Fin d'activité** pour pointer votre départ.\n\n" +
          "**Attention**\n" +
          "Veillez à bien vous connecter à un salon vocal **Work** pour que votre prise d'activité soit bien prise en compte.",
        footer: {
          text: `Merci à vous et bon courage - ${APP.NAME}`,
          icon_url: APP.LOGO,
        },
      };

      // add buttons to the embed message
      textChannel.send({
        embeds: [instructionEmbed],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: ButtonStyle.Primary,
                label: "✨ Prise d'activité",
                custom_id: "worktime_start",
              },
              {
                type: 2,
                style: ButtonStyle.Danger,
                label: "🚪 Fin d'activité",
                custom_id: "worktime_end",
              },
            ],
          },
        ],
      });
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    // check if the button has the custom id worktime_start
    switch (interaction.customId) {
      case "worktime_start":
        // validate interaction and delete
        if (await isInWorkVoiceChannel(client, interaction.user.id)) {
          interaction.deferReply();

          startWorktime(client, interaction.user.id);

          interaction.deleteReply();
        } else {
          interaction.reply(
            "❌ - Vous devez être connecté à un salon vocal **Work**"
          );

          setTimeout(() => {
            interaction.deleteReply();
          }, 5000);
        }

        break;

      case "worktime_end":
        interaction.deferReply();

        endWorktime(client, interaction.user.id);

        interaction.deleteReply();
        break;
    }
  });
};

export default WorktimePlugin;
