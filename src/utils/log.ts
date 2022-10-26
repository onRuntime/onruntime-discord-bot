import chalk from "chalk";
import APP from "../constants/main";
import { hook } from "../services/webhook";

hook.setAvatar(APP.LOGO);
hook.setUsername(`Logs | ${APP.NAME}`);

export const prefixes = {
  wait: chalk.cyan("wait") + "  -",
  error: chalk.red("error") + " -",
  warn: chalk.yellow("warn") + "  -",
  ready: chalk.green("ready") + " -",
  info: chalk.cyan("info") + "  -",
  event: chalk.magenta("event") + " -",
};

const discordPrefixes = {
  wait: "⏳",
  error: "❌",
  warn: "⚠️",
  ready: "✅",
  info: "ℹ️",
  event: "📣",
};

export const embed = {
  info: (...message: any[]) => `${discordPrefixes.info} - ${message.join(" ")}`,
  warn: (...message: any[]) => `${discordPrefixes.warn} - ${message.join(" ")}`,
  error: (...message: any[]) =>
    `${discordPrefixes.error} - ${message.join(" ")}`,
  ready: (...message: any[]) =>
    `${discordPrefixes.ready} - ${message.join(" ")}`,
  wait: (...message: any[]) => `${discordPrefixes.wait} - ${message.join(" ")}`,
  event: (...message: any[]) =>
    `${discordPrefixes.event} - ${message.join(" ")}`,
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
