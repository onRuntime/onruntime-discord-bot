import dotenv from "dotenv-flow";
import Log from "./utils/log";
import { ActivityType, Client, TextChannel } from "discord.js";
import { buildEmbed } from "./utils/embed";
import CHANNELS from "./constants/channels";

// main function
const main = async () => {
  // load dotenv files
  dotenv.config({
    default_node_env: "development",
    silent: true,
  });
  Log.info(`current env ${process.env.NODE_ENV}`);

  // log dotenv files in console
  dotenv
    .listDotenvFiles(".", process.env.NODE_ENV)
    .forEach((file) => Log.info(`loaded env from ${file}`));

  // run discord client
  try {
    const client = new Client({
      intents: ["Guilds", "GuildMessages", "GuildMessageReactions"],
    });
    client.login(process.env.DISCORD_TOKEN);
    client.on("ready", () => {
      Log.ready("discord client ready");

      // log guilds where the client is present
      client.guilds.cache.forEach((guild) => {
        Log.info(`running on guild: ${guild.name}`);
      });

      // send welcome message and amount of members in the guild when some join the guild in typescript
      client.on("guildMemberAdd", (member) => {
        Log.info(`handle new member: ${member.user.username}`);
        const guild = member.guild;
        // channel has id 707565175514988669
        const channel = guild.channels.cache.get(
          CHANNELS.TEXT.GENERAL
        ) as TextChannel;
        if (channel) {
          channel.send({
            embeds: [
              buildEmbed({
                description: `**${
                  member.user.username + "#" + member.user.discriminator
                }** joined the discord ! 🎉`,
                footer: {
                  text: `We are now ${guild.memberCount} members`,
                  iconURL: member.user.displayAvatarURL(),
                },
              }),
            ],
          });
        }

        // update member count from community "🌐 • Community - 0" to "🌐 • Community - 1", etc.
        const community = guild.channels.cache.get(
          CHANNELS.CATEGORIES.COMMUNITY
        );
        if (community) {
          community.setName(`🌐 • Community - ${guild.memberCount}`);
        }
      });
      // set activity watching "onruntime.com"
      client.user?.setPresence({
        activities: [
          {
            name: "onruntime.com",
            type: ActivityType.Watching,
          },
        ],
      });
    });
  } catch (err) {
    Log.error(err);
  }
};

// run main function
main();
