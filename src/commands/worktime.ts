import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import Worktime from "../models/Worktime";
import { DiscordCommand } from "../types/command";
import Log from "../utils/log";

const WorktimeCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("worktime")
    .setDescription("Provides information about the worktime.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("La commande à exécuter")
        .setRequired(true)
        .addChoices({
          name: "Annuler la prise d'activité d'un utilisateur",
          value: "cancel",
        })
    )
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Le membre à qui appliquer la commande")
        .setRequired(false)
    ),
  async execute(interaction) {
    const command = interaction.options.getString("command");
    const target = interaction.options.getUser("target");

    switch (command) {
      case "cancel":
        if (
          interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
        ) {
          if (target) {
            // check if target has a not end worktime
            // if yes, delete it
            const worktimes = await Worktime.find({
              userId: target.id,
              endAt: null,
            });

            if (worktimes.length > 0) {
              await Worktime.deleteMany({
                userId: target.id,
                endAt: null,
              });
              Log.info(
                `✅ - La prise d'activité de **${target.username}#${target.discriminator}** a été annulée par **${interaction.user.username}#${interaction.user.discriminator}**.`
              );

              await target.send("❌ - Votre prise d'activité a été annulée.");

              await interaction.reply(
                `✅ - La prise d'activité de ${target.username} a été annulée.`
              );
            } else {
              await interaction.reply(
                `❌ - ${target.username} n'a pas de prise d'activité en cours.`
              );
            }
          } else {
            await interaction.reply("❌ - Vous devez spécifier une cible.");
          }
        } else {
          await interaction.reply(
            "❌ - Vous n'avez pas les permissions nécessaires pour effectuer cette commande."
          );
        }

        setTimeout(async () => {
          await interaction.deleteReply();
        }, 5000);
        break;
    }
  },
};

export default WorktimeCommand;
