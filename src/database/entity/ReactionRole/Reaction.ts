import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from 'typeorm';
import { ReactionRoleEmbed } from './Embed';

@Entity()
export class ReactionRoleReaction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ReactionRoleEmbed, reactionRoleEmbed => reactionRoleEmbed.reactions)
    embed: ReactionRoleEmbed;

    @Column()
    emojiId: string;

    @Column()
    roleId: string;
}