import { DiscordBot, DiscordPlugin } from "@onruntime/ultrad.js";
import {
    Channel,
    Collection,
    Emoji,
    GuildChannel,
    Message,
    MessageReaction,
    PartialUser,
    Role,
    TextChannel,
    User
} from "discord.js";
import { Repository } from "typeorm";

import Bot from "..";
import { ReactionRoleEmbed, ReactionRoleReaction } from '../database/entity';

export class ReactionRolePlugin implements DiscordPlugin {
    name: string = 'reaction-role';

    private readonly REACTION_ROLES_CHANNEL_ID: string = "785980360222834689";

    private readonly repository: Repository<ReactionRoleEmbed>;

    private reactions: Collection<string, string>;

    constructor(bot: Bot) {
        this.repository = bot.database.getRepository(ReactionRoleEmbed);
        this.reactions = new Collection<string, string>();
    }

    enable(bot: DiscordBot): boolean {
        let channel: TextChannel;
        bot.channels.fetch(this.REACTION_ROLES_CHANNEL_ID).then((_channel: Channel) => {
            if(_channel.isText() && _channel.type === 'text') channel = _channel;
            else return false;
        }).catch(() => { return false; })

        bot.on('messageReactionAdd', async (messageReaction: MessageReaction, user: User | PartialUser) => {
            if(user.bot ||
                channel.id !== messageReaction.message.channel.id ||
                !this.reactions.has(messageReaction.emoji.name)) return;
            
            const roleId = this.reactions.get(messageReaction.emoji.name);
            if(!roleId) return false;

            await channel.guild.member(user.id)?.roles.add(roleId);
        });

        bot.on('messageReactionRemove', async (messageReaction: MessageReaction, user: User | PartialUser) => {
            if(user.bot ||
                channel.id !== messageReaction.message.channel.id ||
                !this.reactions.has(messageReaction.emoji.name)) return;
            
            const roleId = this.reactions.get(messageReaction.emoji.name);
            if(!roleId) return false;

            await channel.guild.member(user.id)?.roles.remove(roleId);
        });

        this._fetchEmbeds().then((embeds: ReactionRoleEmbed[]) => (
            embeds.forEach((embed: ReactionRoleEmbed) => {
                channel.messages.fetch(embed.messageId)
                    .then(() => 
                        embed.reactions.forEach((reaction: ReactionRoleReaction) => 
                            this.reactions.set(reaction.emojiId, reaction.roleId)
                        )
                    )
                    .catch(() => { return false });
            })
        ));
        return true;
    }

    disable(bot: DiscordBot): boolean {
        return true;
    }

    private _fetchEmbeds(): Promise<ReactionRoleEmbed[]> {
        return this.repository.find({
            relations: ['reactions']
        });
    }
}