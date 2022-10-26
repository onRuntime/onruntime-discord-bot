import { Webhook } from "discord-webhook-node";
import dotenv from "dotenv-flow";

dotenv.config({
  silent: true,
});

export const hook = new Webhook(process.env.DISCORD_WEBHOOK_URL || "");
