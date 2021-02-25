import { Collection, Message } from 'discord.js';
import { Command } from '@onruntime/ultrad.js';

class ClearCommand implements Command {
    name: string = 'clear';
    aliases: string[] = [];
    options = {
        deleteAfter: true
    };

    handle(message: Message): void {
        message.channel.awaitMessages((m) => m, { max: 10 })
            .then(async (messages: Collection<string, Message>) => {
                await messages.forEach(async (message: Message) => await message.delete());
                message.reply(`\`${messages.values.length}\` messages were deleted!`);
            });
    }
}

export default ClearCommand;