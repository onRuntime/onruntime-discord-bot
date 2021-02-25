import { DiscordPlugin, DiscordBot } from '@onruntime/ultrad.js';

export class PresencePlugin implements DiscordPlugin {
    name: string = 'presence';

    enable(bot: DiscordBot): boolean {
        const user = bot.user;
        if(!user) return false;

        user.setPresence({
            activity: {
                name: 'onruntime.com',
                type: 'WATCHING'
            }
        })
        return true;
    }

    disable(bot: DiscordBot): boolean {
        return true;
    }
}