import {
  SlashCommandBuilder,
  ChannelType,
  TextChannel,
  Colors,
  PermissionFlagsBits,
} from "discord.js";
import CHANNELS from "../constants/channels";
import APP from "../constants/main";
import Warn from "../models/Warn";
import { DiscordCommand } from "../types/command";
import Log from "../utils/log";

const WarnCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a user")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Le membre à qui appliquer la commande")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("La raison de l'avertissement")
        .setRequired(true)
        .addChoices(
          {
            name: "I-1 - Ne réagis pas aux annonces",
            value: "Ne réagis pas aux annonces.",
          },
          {
            name: "I-2 Absence à une réunion",
            value: "Absence à une réunion sans avertir la direction.",
          },
          {
            name: "II-1 - Ne respecte pas les règles de sécurité",
            value:
              "Ne respecte pas les règles de sécurité, réalise des activités dangereuses ou non autorisées.",
          },
          {
            name: "IV-1 - Réalisation d'une activité éclair",
            value:
              "Réalisation d'une activité éclair (moins de 30 minutes) sans avertir la direction.",
          },
          {
            name: "IV-2 - Serveur non approprié pour le travail ou casque coupé",
            value:
              "Serveur non approprié pour le travail ou casque coupé pendant une activité.",
          },
          {
            name: "V-2 - Absence injustifiée de plus de 72h",
            value: "Absence injustifiée de plus de 72h.",
          }
        )
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason");

    if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      if (target && reason) {
        const warn = new Warn({
          userId: target.id,
          reason,
          createdAt: new Date(),
        });

        await warn.save();

        const warns = await Warn.find({ userId: target.id });

        // send a message to the CHANNELS.ONRUNTIME.TEAM.WARN channel
        // with the target and the reason

        // get all guilds to get the CHANNELS.ONRUNTIME.TEAM.WARN channel
        await interaction.client.guilds.fetch();
        // get the CHANNELS.ONRUNTIME.TEAM.WARN channel
        const guilds = interaction.client.channels.cache;
        // dont use forEach because it's async and we need to wait for the result, so use map
        const channels = await Promise.all(
          guilds.map(async (guild) => {
            const channel = await guild.fetch();
            return channel;
          })
        );
        // get the CHANNELS.ONRUNTIME.TEAM.WARN channel
        const channel = channels.find(
          (channel) =>
            channel.id === CHANNELS.ONRUNTIME.TEAM.WARN &&
            channel.type === ChannelType.GuildText
        ) as TextChannel;

        const warnEmbed = {
          color: Colors.Red,
          title: "Warn (Beta)",
          description: `**${target}** a reçu un avertissement et à maintenant **${warns.length}** avertissements.\nRaison: *${reason}*`,
          footer: {
            text: APP.NAME,
            icon_url: APP.LOGO,
          },
        };

        await channel.send({ embeds: [warnEmbed] });

        await interaction.reply(
          `✅ - L'utilisateur ${target.username} a été averti avec succès.`
        );

        Log.info(
          `${interaction.user.username} warned ${target.username} for ${reason}`
        );

        // send a message to the target with the reason
        await target.send(
          `⚠️ - Vous avez été averti pour la raison suivante: **${reason}**\n*Si vous pensez que c'est une erreur, merci de contacter un membre de la direction.*`
        );
      }
    } else {
      await interaction.reply(
        "❌ - Vous n'avez pas les permissions nécessaires pour effectuer cette commande."
      );
    }

    setTimeout(async () => {
      await interaction.deleteReply();
    }, 5000);
  },
};

export default WarnCommand;
