import 'reflect-metadata';
import { DiscordBot } from '@onruntime/ultrad.js';
import * as dotenv from 'dotenv';

import HelpCommand from './commands/Help';
import {
    PresencePlugin,
    ReactionRolePlugin
} from "./plugins";

class Bot extends DiscordBot {
    constructor() {
        super();

        this.registerCommand(new HelpCommand());

        this.registerPlugin(new PresencePlugin());
        this.registerPlugin(new ReactionRolePlugin());

        this.login(process.env.TOKEN);
    }
}

dotenv.config();

new Bot();