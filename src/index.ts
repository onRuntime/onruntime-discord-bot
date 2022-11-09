import { importx } from "@discordx/importer";
import { GatewayIntentBits, Message } from "discord.js";
import dotenv from "dotenv-flow";
import fs from "fs";
import path from "path";

import { Client } from "./client";
import { MongoDBConfig } from "./services/mongodb/config";
import Log from "./utils/log";

dotenv.config({
  default_node_env: "development",
  silent: true,
});
Log.info(`current env ${process.env.NODE_ENV}`);

dotenv
  .listDotenvFiles(".", process.env.NODE_ENV)
  .forEach((file) => Log.info(`loaded env from ${file}`));

const dbConfig = new MongoDBConfig();

export class Main {
  private static _client: Client;

  static get Client(): Client {
    return this._client;
  }

  static async start(): Promise<void> {
    await dbConfig.connect();
    Log.event("connected to mongodb");

    this._client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
      ],
      silent: false,
      simpleCommand: {
        prefix: "!",
      },
      config: {},
    });

    this._client.once("ready", async () => {
      await this._client.initApplicationCommands({
        global: {
          log: true,
        },
        guild: {
          log: true,
        },
      });

      console.log("Bot is ready");
    });

    this._client.on("interactionCreate", (interaction) => {
      this._client.executeInteraction(interaction);
    });

    this._client.on("messageCreate", (message: Message) => {
      this._client.executeCommand(message);
    });

    await importx(path.join(__dirname, "commands/**/*.command.{js,ts}"));

    fs.readdirSync(path.join(__dirname, "plugins"))
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
      .forEach((file) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const plugin = require(path.join(__dirname, "plugins", file)).default;
        plugin(this._client);
        Log.ready(`loaded plugin ${file}`);
      });

    if (!process.env.DISCORD_BOT_TOKEN) {
      throw Error("Could not find BOT_TOKEN in your environment");
    }
    await this._client.login(process.env.DISCORD_BOT_TOKEN);
  }
}

Main.start();
