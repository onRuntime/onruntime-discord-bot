import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from 'typeorm';

import { ReactionRoleReactions } from './Reactions';

@Entity()
export class ReactionRoleEmbed {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    embedId: string;

    @OneToMany(() => ReactionRoleReactions, reactionRoleReactions => reactionRoleReactions.id)
    reactions: ReactionRoleReactions;
}