import dotenv from "dotenv-flow";
import Log from "./utils/log";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import fs from "fs";
import path from "path";
import { MongoDBConfig } from "./services/mongodb/config";
import { ClientWithCommands } from "./types/command";
import DiscordApplication from "./services/discord";

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

  const dbConfig = new MongoDBConfig();

  // run discord client
  try {
    await dbConfig.connect();
    Log.event("connected to mongodb");

    const client: ClientWithCommands = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
      ],
    });

    client.commands = new Collection();
    fs.readdirSync(path.join(__dirname, "commands"))
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
      .forEach((file) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const command = require(path.join(__dirname, "commands", file)).default;
        client.commands?.set(command.data.name, command);
        Log.ready(`loaded command ${file}`);
      });

    fs.readdirSync(path.join(__dirname, "plugins"))
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
      .forEach((file) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const plugin = require(path.join(__dirname, "plugins", file)).default;
        plugin(client);
        Log.ready(`loaded plugin ${file}`);
      });

    client.login(DiscordApplication.bot.token);
  } catch (err) {
    Log.error(err);
  }
};

// run main function
main();
