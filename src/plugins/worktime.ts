import {
  ButtonStyle,
  ChannelType,
  Client,
  Collection,
  Colors,
  Events,
  GuildMember,
  TextChannel,
} from "discord.js";
import CHANNELS from "../constants/channels";
import APP from "../constants/main";
import { DiscordPlugin } from "../types/plugin";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Log from "../utils/log";
import Worktime from "../models/Worktime";
import schedule from "node-schedule";

dayjs.extend(utc);
dayjs.extend(timezone);

const tz = "Europe/Paris";

export const isInWorkVoiceChannel = (
  client: Client<boolean>,
  userId: string | undefined
) => {
  // check all voice channels which a name that contain "work" from each guilds to see if a user with same user id is present
  // return true if the user is present in a voice channel
  // return false if the user is not present in a voice channel
  let isInWorkVoiceChannel = false;
  const guilds = client.guilds.cache;
  guilds.forEach((guild) => {
    const voiceChannels = guild.channels.cache.filter(
      (channel) =>
        channel.name.toLowerCase().includes("work") &&
        channel.type === ChannelType.GuildVoice
    );
    voiceChannels.forEach((channel) => {
      const members = channel.members as Collection<string, GuildMember>;
      members.forEach((member) => {
        if (member.user.id === userId) {
          isInWorkVoiceChannel = true;
        }
      });
    });
  });
  return isInWorkVoiceChannel;
};

const startWorktime = async (client: Client, userId: string | undefined) => {
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
      `✅ - Votre Prise d'activité a été validée à ${dayjs()
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

const endWorktime = async (client: Client, userId: string | undefined) => {
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

    user.send(
      `✅ - Votre Fin d'activité a été validée à ${dayjs()
        .tz(tz)
        .format("HH:mm")} - Vous avez passé ${Math.floor(
        totalWorktime / 1000 / 60 / 60
      )}h${Math.floor(
        (totalWorktime / 1000 / 60) % 60
      )}min à travailler cette semaine`
    );
    Log.info(
      `✅ - Fin d'activité validée à ${dayjs().tz(tz).format("HH:mm")} par **${
        user.username
      }#${user.discriminator}** - ${Math.floor(
        totalWorktime / 1000 / 60 / 60
      )}h${Math.floor((totalWorktime / 1000 / 60) % 60)}min`
    );

    return true;
  } else {
    // if the user has not started his worktime, send a message to the user
    user.send("❌ - Vous n'avez pas commencé votre activité aujourd'hui");

    return false;
  }
};

const WorktimePlugin: DiscordPlugin = (client) => {
  // delete all message from CHANNELS.ONRUNTIME.TEAM.WORKTIME channel on startup, dont forget to check if it's a text channel
  client.on("ready", async () => {
    const channel = await client.channels.cache.get(
      CHANNELS.ONRUNTIME.TEAM.WORKTIME
    );
    if (channel?.type === ChannelType.GuildText) {
      const textChannel = channel as TextChannel;
      const messages = await textChannel.messages.fetch();
      messages.forEach(async (message) => await message.delete());

      // worktime sert a pointé les heures des membres de l'équipe
      // appuyez sur le bouton Prise d'activité pour pointer votre arrivée
      // puis Fin d'activité pour pointer votre départ
      // veillez a bien vous connecter à un salon vocal pour que votre Prise d'activité soit bien prise en compte
      // send this message to CHANNELS.ONRUNTIME.TEAM.WORKTIME channel as an embed message

      const instructionEmbed = {
        color: Colors.White,
        title: "Worktime (Beta)",
        description:
          "Pointage des heures des membres de l'équipe\n\n" +
          "**Prise d'activité**\n" +
          "Appuyez sur le bouton Prise d'activité pour pointer votre arrivée\n\n" +
          "**Fin d'activité**\n" +
          "Appuyez sur le bouton Fin d'activité pour pointer votre départ\n\n" +
          "**Attention**\n" +
          "Veillez à bien vous connecter à un salon vocal **Work** pour que votre Prise d'activité soit bien prise en compte",
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
        if (isInWorkVoiceChannel(client, interaction.user.id)) {
          //interaction.reply("✅ Prise d'activité validée");
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

  // if a user which as started his worktime disconnect from the voice channel more than 10 minutes, end his worktime
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    if (
      oldState.channelId &&
      !newState.channelId &&
      oldState.channel?.name.toLowerCase().includes("work")
    ) {
      const worktime = await Worktime.findOne({
        userId: oldState.member?.user.id,
        endAt: null,
      });

      if (worktime) {
        const diff = dayjs().diff(dayjs(worktime.startAt), "minute");

        if (diff > 10) {
          endWorktime(client, oldState.member?.user.id);
        }
      }
    }
  });

  // every sunday at midday, send a leaderboard in CHANNELS.ONRUNTIME.TEAM.LEADERBOARD
  schedule.scheduleJob("0 12 * * 0", async () => {
    // schedule.scheduleJob("* * * * *", async () => {
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

export default WorktimePlugin;
