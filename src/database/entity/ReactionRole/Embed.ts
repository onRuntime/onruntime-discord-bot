import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from 'typeorm';

import { RRReaction } from './Reaction';

@Entity({ name: 'reaction_role_embed' })
export class RREmbed {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    messageId: string;

    @OneToMany(() => RRReaction, rrReaction => rrReaction.embed)
    reactions: RRReaction[];
}