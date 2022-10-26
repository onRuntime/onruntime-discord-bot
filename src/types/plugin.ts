import { Client } from "discord.js";

export type DiscordPlugin = (client: Client<boolean>) => void;
