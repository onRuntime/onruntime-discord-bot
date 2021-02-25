import { DiscordBot } from '@onruntime/ultrad.js';

import globalSetup from './config/setup';
import { Database } from './database';
import { Guild } from 'discord.js';
import Logger from './logger';

class Bot extends DiscordBot {
    readonly database: Database;
    readonly logger: Logger;

    guild: Guild;

    constructor() {
        super();

        this.database = new Database();

        this.logger = new Logger(this);
        this.logger.enableLogging({
            type: 'all'
        });

        this.database.on('CONNECTED', () => {
            globalSetup(this);
            
            this.login(process.env.TOKEN).then(async () => {
                const guildId = process.env.DEFAULT_GUILD_ID;
                if(guildId) this.guild = await this.guilds.fetch(guildId);

                console.log('Bot started.')
            })
        });
    }
}

export default Bot;