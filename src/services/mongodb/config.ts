import mongoose from "mongoose";
import dotenv from "dotenv-flow";

dotenv.config({
  silent: true,
});

export class MongoDBConfig {
  private readonly dsn: string = "";

  constructor() {
    this.dsn = this.buildDsn(
      process.env.MONGODB_METHOD || "mongodb+srv",
      process.env.MONGODB_USERNAME || "",
      process.env.MONGODB_PASSWORD || "",
      process.env.MONGODB_SERVER_URI || "",
      process.env.MONGODB_DATABASE || "",
      process.env.MONGODB_PARAMS?.split(",") || []
    );
  }

  private buildDsn(
    method: string,
    username: string,
    password: string,
    serverUri: string,
    databaseName: string,
    params: string[]
  ): string {
    if (method.includes("srv") && username && password) {
      return `${method}://${username}:${password}@${serverUri}/${databaseName}${
        params && params.length > 0 ? `?${params.join("&")}` : ""
      }`;
    }

    return `${method}://${serverUri}/${databaseName}${
      params && params.length > 0 ? `?${params.join("&")}` : ""
    }`;
  }

  async connect() {
    if (!this.dsn) return;

    return await mongoose.connect(this.dsn);
  }
}
