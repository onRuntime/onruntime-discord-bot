import dotenv from "dotenv-flow";
import Log from "./utils/log";
import { Client } from "discord.js";
import fs from "fs";
import path from "path";

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
    client.login(process.env.DISCORD_TOKEN || "");
    client.on("ready", () => {
      Log.ready("discord client ready");

      fs.readdirSync(path.join(__dirname, "plugins"))
        .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
        .forEach((file) => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const plugin = require(path.join(__dirname, "plugins", file)).default;
          plugin(client);
          Log.ready(`loaded plugin ${file}`);
        });

      // log guilds where the client is present
      client.guilds.cache.forEach((guild) => {
        Log.info(`running on guild: ${guild.name}`);
      });
    });
  } catch (err) {
    Log.error(err);
  }
};

// run main function
main();
