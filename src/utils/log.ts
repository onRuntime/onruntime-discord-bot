import chalk from "chalk";
import { MessageBuilder } from "discord-webhook-node";
import APP from "../constants/main";
import { hook } from "../services/webhook";

hook.setAvatar(APP.LOGO);
hook.setUsername("Logs | Expat Facilities");

export const prefixes = {
  wait: chalk.cyan("wait") + "  -",
  error: chalk.red("error") + " -",
  warn: chalk.yellow("warn") + "  -",
  ready: chalk.green("ready") + " -",
  info: chalk.cyan("info") + "  -",
  event: chalk.magenta("event") + " -",
};

const builder = (...message: any[]) =>
  new MessageBuilder()
    .setDescription(
      message
        .map((m) => (typeof m === "string" ? m : JSON.stringify(m)))
        .join("\n")
    )
    .setFooter(APP.NAME, APP.LOGO)
    .setTimestamp();

export const embed = {
  info: (...message: any[]) => builder(...message).setColor(5366244),
  event: (...message: any[]) => builder(...message).setColor(15753645),
  ready: (...message: any[]) => builder(...message).setColor(1299607),
  warn: (...message: any[]) => builder(...message).setColor(16562066),
  error: (...message: any[]) => builder(...message).setColor(15422583),
  wait: (...message: any[]) => builder(...message).setColor(5366244),
};

const Log = {
  info: (...message: any[]) => {
    console.log(prefixes.info, ...message);
    if (process.env.NODE_ENV === "production")
      hook.send(embed.info(...message));
  },
  warn: (...message: any[]) => {
    console.warn(prefixes.warn, ...message);
    if (process.env.NODE_ENV === "production")
      hook.send(embed.warn(...message));
  },
  error: (...message: any[]) => {
    console.error(prefixes.error, ...message);
    if (process.env.NODE_ENV === "production")
      hook.send(embed.error(...message));
  },
  ready: (...message: any[]) => {
    console.log(prefixes.ready, ...message);
    if (process.env.NODE_ENV === "production")
      hook.send(embed.ready(...message));
  },
  wait: (...message: any[]) => {
    console.log(prefixes.wait, ...message);
    if (process.env.NODE_ENV === "production")
      hook.send(embed.wait(...message));
  },
  event: (...message: any[]) => {
    console.log(prefixes.event, ...message);
    if (process.env.NODE_ENV === "production")
      hook.send(embed.event(...message));
  },
};

export default Log;
