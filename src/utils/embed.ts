import { MessageEmbed } from "discord.js";

interface Props {
  title?: string;
  description?: string;
  footer?: {
    text: string;
    iconURL: string;
  };
}

/*
 * This embed is currently a prototype to improve
 */

export const buildEmbed = ({
  title,
  description,
  footer,
}: Props): MessageEmbed => {
  const embed = new MessageEmbed();

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (footer) embed.setFooter(footer);

  return embed;
};
