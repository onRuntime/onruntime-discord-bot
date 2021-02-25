import { DiscordPlugin, DiscordBot } from "@onruntime/ultrad.js";

export class MusicPlugin implements DiscordPlugin {
    name: string = 'music';

    enable(bot: DiscordBot): boolean {
        return true;
    }

    disable(bot: DiscordBot): boolean {
        return true;
    }
}