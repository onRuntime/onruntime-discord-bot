import { MessageEmbed } from "discord.js";

const infoColor = "#fff000";
const failColor = "0xeb3452";
const successColor = "0x34eb86";

export const createEmbed = (
  type: "info" | "fail" | "success",
  description: string,
  ...otherArgs: string[]
): MessageEmbed => {
  const embed = new MessageEmbed()
    .setColor(
      type === "success"
        ? successColor
        : type === "fail"
        ? failColor
        : type === "info"
        ? infoColor
        : infoColor
    )
    .setDescription(
      `${
        type === "success"
          ? "<:aneoTick:837567483422179358>"
          : type === "fail"
          ? "<:aneoError:837566696818343956>"
          : ""
      } ${description}`
    );
  return embed;
};
