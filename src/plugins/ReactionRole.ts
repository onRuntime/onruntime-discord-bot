import { DiscordPlugin, DiscordBot } from "@onruntime/ultrad.js";

export class ReactionRolePlugin implements DiscordPlugin {
    name: string = 'reaction-role';

    constructor(bot: DiscordBot) {
    }

    enable(bot: DiscordBot): boolean {
        return true;
    }

    disable(bot: DiscordBot): boolean {
        return true;
    }
}