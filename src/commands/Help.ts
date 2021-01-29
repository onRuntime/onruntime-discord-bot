import { Message } from "discord.js";
import { Command } from "@onruntime/ultrad.js";

class HelpCommand implements Command {
    name: string = 'help';
    aliases: string[] = ['?', 'aide'];
    options = {
        deleteAfter: true
    };

    handle(message: Message): void {
        message.reply('Aide');
    }
}

export default HelpCommand;