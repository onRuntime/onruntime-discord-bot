import { Game } from "@gathertown/gather-game-client";
import dixt, { DixtPlugin, Log, merge } from "dixt";
import * as cron from "node-cron";
import WebSocket from "ws";

const name = "dixt-plugin-gather";

let globalPlayerCount = 0;

export const getGatherCount = () => globalPlayerCount;

export interface DixtPluginGatherOptions {
  spaceId?: string;
  apiKey?: string;
  tasks?: {
    update?: string;
  };
}

export const optionsDefaults: DixtPluginGatherOptions = {
  spaceId: process.env.DIXT_PLUGIN_GATHER_SPACE_ID || "",
  apiKey: process.env.DIXT_PLUGIN_GATHER_API_KEY || "",
  tasks: {
    update: process.env.DIXT_PLUGIN_GATHER_UPDATE_TASK || "*/30 * * * * *",
  },
};

const dixtPluginGather: DixtPlugin<DixtPluginGatherOptions> = (
  instance: dixt,
  optionsValue?: DixtPluginGatherOptions,
) => {
  const options = merge({}, optionsDefaults, optionsValue);
  const { client } = instance;
  const { spaceId, apiKey } = options;

  let game: Game | null = null;
  let playerCount = 0;
  let updateTask: cron.ScheduledTask | null = null;

  const updatePlayerCount = () => {
    if (game?.players) {
      const allPlayers = Object.values(game.players);
      const realPlayers = allPlayers.filter(
        (player) => player.name && player.name !== "Unknown",
      );
      const newPlayerCount = realPlayers.length;

      if (newPlayerCount !== playerCount) {
        const playerNames = realPlayers.map((player) => player.name).join(", ");

        Log.info(
          `Players online (${newPlayerCount}): ${playerNames || "None"}`,
        );

        playerCount = newPlayerCount;
        globalPlayerCount = newPlayerCount;
      }
    }
  };

  if (!spaceId) {
    Log.error(`${name} - spaceId is required`);
    throw new Error(`${name} - spaceId is required`);
  }

  if (!apiKey) {
    Log.error(`${name} - apiKey is required`);
    throw new Error(`${name} - apiKey is required`);
  }

  client.once("ready", () => {
    // Set WebSocket globally for Node.js environment
    if (typeof global !== "undefined" && !global.WebSocket) {
      global.WebSocket = WebSocket as any;
    }

    const formattedSpaceId = spaceId.replace(/\//g, "\\");
    game = new Game(formattedSpaceId, () => Promise.resolve({ apiKey }));

    game.subscribeToConnection((connected) => {
      if (connected) {
        Log.ready("Connected to Gather");
        updatePlayerCount();

        if (game?.players) {
          const allPlayers = Object.values(game.players);
          const realPlayers = allPlayers.filter(
            (player) => player.name && player.name !== "Unknown",
          );
          const initialPlayerCount = realPlayers.length;
          const playerNames = realPlayers
            .map((player) => player.name)
            .join(", ");

          Log.info(
            `Initial players online (${initialPlayerCount}): ${
              playerNames || "None"
            }`,
          );
        }
      } else {
        Log.warn("Disconnected from Gather");
      }
    });

    game.subscribeToEvent("playerJoins", () => {
      updatePlayerCount();
    });

    game.subscribeToEvent("playerExits", () => {
      updatePlayerCount();
    });

    try {
      game.connect();
    } catch (error) {
      Log.error("Failed to connect to Gather:", error);
    }

    if (options.tasks?.update) {
      updateTask = cron.schedule(options.tasks.update, () => {
        updatePlayerCount();
      });
      updateTask.start();
    }
  });

  client.once("destroy", () => {
    if (game) {
      game.disconnect();
    }
    if (updateTask) {
      updateTask.stop();
    }
  });

  return {
    name,
  };
};

export default dixtPluginGather;
