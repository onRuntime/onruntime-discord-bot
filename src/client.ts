import { Client as DiscordClient, ClientOptions } from "discordx";
import { WorkTime } from "./common/worktime";

interface Options extends ClientOptions {
  config: {};
}

export class Client extends DiscordClient {
  private _worktime: WorkTime;

  constructor(options: Options) {
    super(options);
  }

  get worktime() {
    return this._worktime;
  }
}
