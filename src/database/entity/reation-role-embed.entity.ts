import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from 'typeorm';

@Entity()
export class ReactionRoleEmbed {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    embedId: string;

    @OneToMany(() => ReactionRoleReaction, reactionRoleReaction => reactionRoleReaction.id)
    reactions: ReactionRoleReaction;
}