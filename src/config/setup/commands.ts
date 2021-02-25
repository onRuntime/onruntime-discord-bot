import { DiscordBot } from "@onruntime/ultrad.js";

import ClearCommand from "../../commands/Clear";
import HelpCommand from "../../commands/Help";

export default (bot: DiscordBot) => {
    bot.registerCommand(new HelpCommand());
    bot.registerCommand(new ClearCommand());
}