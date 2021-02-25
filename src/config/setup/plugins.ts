import Bot from "../../Bot";
import { MusicPlugin, PresencePlugin, ReactionRolePlugin } from "../../plugins";

export default (bot: Bot) => {
    bot.registerPlugin(new MusicPlugin());
    bot.registerPlugin(new PresencePlugin());
    bot.registerPlugin(new ReactionRolePlugin());
}