import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import QUOTAS from "../constants/quotas";
import Worktime from "../models/Worktime";
import { getUserStatusId, addWorktime } from "../plugins/worktime";
import { DiscordCommand } from "../types/command";
import Log from "../utils/log";
import pad from "../utils/pad";
import progressIndicator from "../utils/progressIndicator";

const WorktimeCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("worktime")
    .setDescription("Provides information about the worktime.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("La commande à exécuter")
        .setRequired(true)
        .addChoices(
          {
            name: "Obtenir des informations sur le temps de travail",
            value: "info",
          },
          {
            name: "Annuler la prise d'activité d'un utilisateur",
            value: "cancel",
          },
          {
            name: "Augmenter le quota d'un utilisateur",
            value: "add",
          }
        )
    )
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Le membre à qui appliquer la commande")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("La durée de l'activité")
        .setRequired(false)
    ),
  async execute(interaction) {
    const command = interaction.options.getString("command");
    const target = interaction.options.getUser("target");
    const duration = interaction.options.getString("duration");

    switch (command) {
      case "info":
        if (!target) {
          const worktimes = await Worktime.find({
            userId: interaction.user.id,
          });

          if (worktimes.length === 0) {
            await interaction.reply(
              "Vous n'avez pas encore travaillé cette semaine."
            );
          } else {
            // get the total worktime even if the worktime is in progress
            const totalWorktime = worktimes.reduce(
              (total, worktime) =>
                total +
                (worktime.endAt
                  ? worktime.endAt.getTime() - worktime.startAt.getTime()
                  : Date.now() - worktime.startAt.getTime()),
              0
            );

            const statusId = await getUserStatusId(
              interaction.client,
              interaction.user
            );
            // convert totalWorktime to hours
            const totalWorktimeInHours = totalWorktime / 1000 / 60 / 60;
            // percentage of the totalWorktimeInHours compared to the quota
            const percentage = statusId
              ? (totalWorktimeInHours / QUOTAS[statusId]) * 100
              : 0;

            await interaction.reply(
              `⏳ - Vous avez passé ${pad(
                Math.floor(totalWorktime / 1000 / 60 / 60),
                2
              )}h${pad(
                Math.floor((totalWorktime / 1000 / 60) % 60),
                2
              )}min à travailler cette semaine - ${
                // percentage of total work based on totalWorktime and QUOTAS[getUserStatus(user)],
                statusId
                  ? progressIndicator(percentage)
                  : "Vous n'avez pas de rôle d'employé, pensez à le demander."
              }`
            );
          }
        } else {
          if (
            interaction.memberPermissions?.has(
              PermissionFlagsBits.Administrator
            )
          ) {
            const worktimes = await Worktime.find({
              userId: target.id,
            });

            if (worktimes.length === 0) {
              await interaction.reply(
                `${target.username} n'a pas encore travaillé cette semaine.`
              );
            } else {
              // get the total worktime even if the worktime is in progress
              const totalWorktime = worktimes.reduce(
                (total, worktime) =>
                  total +
                  (worktime.endAt
                    ? worktime.endAt.getTime() - worktime.startAt.getTime()
                    : Date.now() - worktime.startAt.getTime()),
                0
              );

              const statusId = await getUserStatusId(
                interaction.client,
                target
              );
              // convert totalWorktime to hours
              const totalWorktimeInHours = totalWorktime / 1000 / 60 / 60;
              // percentage of the totalWorktimeInHours compared to the quota
              const percentage = statusId
                ? (totalWorktimeInHours / QUOTAS[statusId]) * 100
                : 0;

              await interaction.reply(
                `⏳ - ${target.username} a passé ${pad(
                  Math.floor(totalWorktime / 1000 / 60 / 60),
                  2
                )}h ${pad(
                  Math.floor((totalWorktime / 1000 / 60) % 60),
                  2
                )}min à travailler cette semaine - ${
                  // percentage of total work based on totalWorktime and QUOTAS[getUserStatus(user)],
                  statusId
                    ? progressIndicator(percentage)
                    : "Cet utilisateur n'a pas de rôle d'employé."
                }`
              );
            }
          }
        }

        break;
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
        break;
      case "add":
        if (
          interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
        ) {
          if (target && duration) {
            await addWorktime(interaction.client, target.id, duration);
            Log.info(
              `✅ - La prise d'activité de **${target.username}#${target.discriminator}** a été augmenté par **${interaction.user.username}#${interaction.user.discriminator}**.`
            );
            await interaction.reply(
              `✅ - La prise d'activité de ${target.username} a été augmenté de ${duration}.`
            );
          } else {
            await interaction.reply(
              "❌ - Vous devez spécifier une cible et une durée."
            );
          }
        }
    }

    setTimeout(async () => {
      await interaction.deleteReply();
    }, 5000);
  },
};

export default WorktimeCommand;
