import * as dotenv from 'dotenv';

import Bot from '../Bot';
import setupCommands from './setup/commands';
import setupPlugins from './setup/plugins';
import setupTranslations from './setup/translations';

export default (bot: Bot) => {
    setupCommands(bot);
    setupPlugins(bot);
    //setupTranslations();

    dotenv.config();
};