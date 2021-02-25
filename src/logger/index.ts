import { Client } from "discord.js";
import { getRepository, Repository } from "typeorm";
import { ORTGuild } from "../database/entity/Guild";

interface LogOptions {
    type: 'all';
}

class Logger {
    private _client: Client;

    private _guildRepository: Repository<ORTGuild>;

    constructor(client: Client) {
        this._client = client;

        this._client.once('ready', () => {
            this._guildRepository = getRepository(ORTGuild);
        });
    }

    enableLogging(options: LogOptions = { type: 'all' }): void {}
}

export default Logger;