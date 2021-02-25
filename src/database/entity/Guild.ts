import {
    Entity,
    Column,
    Unique,
    PrimaryColumn
} from 'typeorm';

@Entity({ name: 'guild' })
@Unique(['guildId'])
export class ORTGuild {
    @PrimaryColumn()
    guildId: string;

    @Column()
    logChannelId: string;
}