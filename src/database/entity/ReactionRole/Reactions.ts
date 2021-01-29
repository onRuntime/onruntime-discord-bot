import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from 'typeorm';

@Entity()
export class ReactionRoleReactions {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    emojiId: string;

    @Column()
    roleId: string;
}