import { Command, DiscordBot, DiscordPlugin } from '@onruntime/ultrad.js';
import {
    Channel,
    Client,
    Collection,
    DMChannel,
    Guild,
    GuildMember,
    Message,
    MessageEmbed,
    MessageReaction,
    PartialUser,
    Role,
    TextChannel,
    User
} from 'discord.js';
import { getRepository, Repository } from 'typeorm';

import { RREmbed, RRReaction } from '../database/entity';
import useTranslate from '../hooks/useTranslate';
import createMessageEmbed from '../utils/createMessageEmbed';
import formatEmoji from '../utils/formatEmoji';
import sendMessageWithTyping from '../utils/sendMessageWithTyping';

export class ReactionRolePlugin implements DiscordPlugin {
    name: string = 'reaction-role';

    private readonly REACTION_ROLES_CHANNEL_ID: string = '785980360222834689';

    private readonly repository: Repository<RREmbed>;

    private reactions: Collection<string, string>;

    constructor() {
        this.repository = getRepository(RREmbed);
        this.reactions = new Collection<string, string>();
    }

    enable(bot: DiscordBot): boolean {
        const channel: Channel | null = bot.channels.resolve(this.REACTION_ROLES_CHANNEL_ID);
        if(!channel || !(channel instanceof TextChannel)) return false;
        
        this._registerListener(bot, channel);

        this._fetchEmbeds().then((embeds: RREmbed[]) => (
            embeds.forEach((embed: RREmbed) => {
                channel.messages.fetch(embed.messageId)
                    .then(() => embed.reactions.forEach((reaction: RRReaction) => 
                            this.reactions.set(reaction.emoji, reaction.roleId)
                        )
                    )
                    .catch(async () => {
                        this._sendUnknownEmbed(embed, channel).then((message: Message) => {
                            embed.messageId = message.id;
                            this.repository.save(embed);
                        });
                    });
            })
        ));
        return true;
    }

    disable(bot: DiscordBot): boolean {
        return true;
    }

    private _registerListener(client: Client, channel: TextChannel): void {
        const { __ } = useTranslate();

        client.on('messageReactionAdd', async (messageReaction: MessageReaction, user: User | PartialUser) => {
            if(user.bot ||
                channel.id !== messageReaction.message.channel.id ||
                !this.reactions.has(messageReaction.emoji.name)) return;
            
            const roleId = this.reactions.get(messageReaction.emoji.name);
            if(!roleId) return false;

            channel.guild.member(user.id)?.roles.add(roleId)
                .then(async (member: GuildMember) => {
                    const dmChannel: DMChannel = await member.createDM(true);
                    const role: Role | null = await channel.guild.roles.fetch(roleId);
                    if(!role || !dmChannel) return;

                    sendMessageWithTyping(dmChannel, `You have been successfully assigned to **${role.name}** role.`);
                });
        });

        client.on('messageReactionRemove', async (messageReaction: MessageReaction, user: User | PartialUser) => {
            if(user.bot ||
                channel.id !== messageReaction.message.channel.id ||
                !this.reactions.has(messageReaction.emoji.name)) return;
            
            const roleId = this.reactions.get(messageReaction.emoji.name);
            if(!roleId) return false;

            channel.guild.member(user.id)?.roles.remove(roleId)
                .then(async (member: GuildMember) => {
                    const dmChannel: DMChannel = await member.createDM(true);
                    const role: Role | null = await channel.guild.roles.fetch(roleId);
                    if(!role || !dmChannel) return;

                    sendMessageWithTyping(dmChannel, `You have been unassigned from **${role.name}** role.`);
                });
        });
    }

    private _fetchEmbeds(): Promise<RREmbed[]> {
        return this.repository.find({
            relations: ['reactions']
        });
    }

    private _createEmbed(guild: Guild, title: string, reactions: RRReaction[]): MessageEmbed {
        const embed: MessageEmbed = createMessageEmbed();

        embed.setAuthor(title);
        reactions.forEach((reaction: RRReaction) => {
            const formattedEmoji: string = formatEmoji(reaction.emoji, reaction.isGuildEmoji);
            const role: Role | undefined = guild.roles.cache.get(reaction.roleId);
            if(!role) return;

            embed.addField(`${formattedEmoji}`, role, true);
        });

        return embed;
    }

    private async _sendUnknownEmbed(embed: RREmbed, channel: TextChannel): Promise<Message> {
        const newEmbed: MessageEmbed = this._createEmbed(channel.guild, embed.title, embed.reactions);

        return new Promise((resolve, reject) => {
            channel.send(newEmbed).then((message: Message) => {
                resolve(message);

                embed.reactions.forEach((reaction: RRReaction) => 
                    message.react(reaction.emoji)
                )
            }).then(() => reject());
        });
    }
}

class ReactionRoleCommand implements Command {
    name: string = 'reactionrole';
    aliases: string[] = ['rr'];
    options = {
        deleteAfter: false
    };

    handle(message: Message): void {
    }
}