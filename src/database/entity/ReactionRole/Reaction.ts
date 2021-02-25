import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from 'typeorm';

import { RREmbed } from './Embed';

@Entity({ name: 'reaction_role_reaction' })
export class RRReaction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => RREmbed, rrEmbed => rrEmbed.reactions)
    embed: RREmbed;

    @Column()
    emoji: string;

    @Column()
    isGuildEmoji: boolean;

    @Column()
    roleId: string;
}