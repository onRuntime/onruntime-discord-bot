import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from 'typeorm';

import { ReactionRoleReaction } from './Reaction';

@Entity()
export class ReactionRoleEmbed {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    messageId: string;

    @OneToMany(() => ReactionRoleReaction, reactionRoleReaction => reactionRoleReaction.embed)
    reactions: ReactionRoleReaction[];
}