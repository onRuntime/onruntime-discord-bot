import {createConnection, Connection, Repository, EntityTarget} from 'typeorm';
import { EventEmitter } from 'ws';

export class Database extends EventEmitter {
    private _connection: Connection;

    constructor() {
        super();

        createConnection()
            .then((connection: Connection) => {
                this._connection = connection;

                this.emit('CONNECTED');
            })
            .catch((error: string) => console.log(error));
    }

    isConnected(): boolean {
        return this._connection && this._connection.isConnected;
    }

    getRepository<T>(entity: EntityTarget<T>): Repository<T> {
        return this._connection.getRepository(entity);
    }
}