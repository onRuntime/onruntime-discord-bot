import chalk from "chalk";
import APP from "../constants/main";
import { hook } from "../services/webhook";
import reduceString from "./reduceString";

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

export const embed = (
  type: keyof typeof prefixes,
  ...message: any[]
): string => {
  let result = "";

  switch (type) {
    case "info":
      result = `${discordPrefixes.info}`;
      break;
    case "warn":
      result = `${discordPrefixes.warn}`;
      break;
    case "error":
      result = `${discordPrefixes.error}`;
      break;
    case "ready":
      result = `${discordPrefixes.ready}`;
      break;
    case "wait":
      result = `${discordPrefixes.wait}`;
      break;
    case "event":
      result = `${discordPrefixes.event}`;
      break;
  }

  result += ` - ${message.join(" ")}`;
  result = reduceString(result, 2000);

  return result;
};

const Log = {
  info: (...message: any[]) => {
    console.log(prefixes.info, ...message);
    if (process.env.NODE_ENV === "production")
      hook.send(embed("info", ...message));
  },
  warn: (...message: any[]) => {
    console.warn(prefixes.warn, ...message);
    if (process.env.NODE_ENV === "production")
      hook.send(embed("warn", ...message));
  },
  error: (...message: any[]) => {
    console.error(prefixes.error, ...message);
    if (process.env.NODE_ENV === "production")
      hook.send(embed("error", ...message));
  },
  ready: (...message: any[]) => {
    console.log(prefixes.ready, ...message);
    if (process.env.NODE_ENV === "production")
      hook.send(embed("ready", ...message));
  },
  wait: (...message: any[]) => {
    console.log(prefixes.wait, ...message);
    if (process.env.NODE_ENV === "production")
      hook.send(embed("wait", ...message));
  },
  event: (...message: any[]) => {
    console.log(prefixes.event, ...message);
    if (process.env.NODE_ENV === "production")
      hook.send(embed("event", ...message));
  },
};

export default Log;
