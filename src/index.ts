import 'reflect-metadata';
import { DiscordBot } from '@onruntime/ultrad.js';
import * as dotenv from 'dotenv';

import HelpCommand from './commands/Help';
import { MusicPlugin, PresencePlugin, ReactionRolePlugin } from "./plugins";
import { Database } from './database';
import { Guild } from 'discord.js';

class Bot extends DiscordBot {
    readonly database: Database;

    guild: Guild;

    constructor() {
        super();

        this.database = new Database();

        const setupCommands = () => {
            this.registerCommand(new HelpCommand());
        }

        const setupPlugins = () => {
            this.registerPlugin(new MusicPlugin());
            this.registerPlugin(new PresencePlugin());
            this.registerPlugin(new ReactionRolePlugin(this));
        }

        this.database.on('CONNECTED', () => {
            setupCommands();
            setupPlugins();
            
            this.login(process.env.TOKEN).then(async () => {
                const guildId = process.env.DEFAULT_GUILD_ID;
                if(guildId) this.guild = await this.guilds.fetch(guildId);

                console.log('Bot started.')
            })
        });
    }
}

dotenv.config();

new Bot();

export default Bot;