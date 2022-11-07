import { ClientWithCommands } from "./command";

export type DiscordPlugin = (client: ClientWithCommands) => void;
