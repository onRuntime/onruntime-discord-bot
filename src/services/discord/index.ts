import dotenv from "dotenv-flow";

dotenv.config({
  silent: true,
});

const DiscordApplication = {
  id: process.env.DISCORD_APPLICATION_ID || "",
  bot: {
    token: process.env.DISCORD_BOT_TOKEN || "",
  },
};

export default DiscordApplication;
