import {
  ButtonStyle,
  ChannelType,
  Colors,
  Events,
  Guild,
  Interaction,
  PermissionFlagsBits,
  TextChannel,
  User,
} from "discord.js";
import CHANNELS from "../constants/channels";
import APP from "../constants/main";
import { DiscordPlugin } from "../types/plugin";

export type TicketType = "partner" | "recruitment";

const addTicket = async (guild: Guild, user: User, type: TicketType) => {
  const emojis: Record<TicketType, string> = {
    partner: "🤝",
    recruitment: "📥",
  };

  const descriptions: Record<TicketType, string> = {
    recruitment:
      "Afin de traiter votre demande de recrutement, merci de nous fournir les informations suivantes:\n" +
      "- Votre nom et prénom\n" +
      "- Votre âge\n" +
      "- Votre domaine d'expertise\n" +
      "- Vos disponibilités (jours et horaires)\n\n" +
      "Ensuite, un membre de l'équipe vous contactera dans les plus brefs délais afin de vous donner une date pour un premier entretien.",
    partner:
      "Afin de traiter votre demande de partenariat, merci de nous fournir les informations suivantes:\n" +
      "- Votre nom et prénom\n" +
      "- Le nom de votre structure\n" +
      "- Brièvement ceux en quoi consisterait ce partenariat (ex: échange de visibilité, de contenu, de services, etc.)\n\n" +
      "Ensuite, un membre de l'équipe vous contactera dans les plus brefs délais.",
  };

  // check if the user already has a ticket
  await guild.channels.fetch();
  const tickets = guild.channels.cache.filter(
    (channel) =>
      channel.type === ChannelType.GuildText &&
      channel.name.startsWith(`${emojis[type]}`) &&
      channel.topic?.includes(`${user.username}#${user.discriminator}`) &&
      channel.parentId === CHANNELS.ONRUNTIME.SUPPORT._ID
  );

  if (tickets.size > 0) {
    // send a private message to the user
    const channel = tickets.first() as TextChannel;
    await user.send(
      `❌ - Vous avez déjà un ticket de ce type ouvert dans le salon ${channel}.`
    );
    return;
  }

  const channel = await guild.channels.create({
    type: ChannelType.GuildText,
    name: `${emojis[type]}｜${user.username}`,
    topic: `Ticket de ${user.username}#${user.discriminator}`,
    parent: CHANNELS.ONRUNTIME.SUPPORT._ID,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: user.id,
        allow: [PermissionFlagsBits.ViewChannel],
      },
    ],
  });

  const instructionEmbed = {
    color: Colors.White,
    title: "Ticket (Beta)",
    description: `Bonjour ${user} !\n\n` + descriptions[type],
    footer: {
      text: APP.NAME,
      icon_url: APP.LOGO,
    },
  };

  // send a message to the channel with the user's id
  await channel.send({
    embeds: [instructionEmbed],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: ButtonStyle.Danger,
            label: "❌ Fermer le ticket",
            custom_id: "ticket_close",
          },
        ],
      },
    ],
  });
};

const closeTicket = async (interaction: Interaction) => {
  const channel = interaction.channel as TextChannel;
  if (!channel) return;
  // move the channel to the archives category and remove users permissions
  await channel.edit({
    parent: CHANNELS.ONRUNTIME.ARCHIVES._ID,
    permissionOverwrites: [
      {
        id: channel.guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      },
    ],
  });

  // delete interaction
  await (interaction as any).message.delete();
};

const TicketPlugin: DiscordPlugin = (client) => {
  client.on(Events.ClientReady, async () => {
    const channel = await client.channels.cache.get(
      CHANNELS.ONRUNTIME.INFORMATION.SUPPORT
    );
    if (channel?.type === ChannelType.GuildText) {
      const textChannel = channel as TextChannel;
      const messages = await textChannel.messages.fetch();

      const instructionEmbed = {
        color: Colors.White,
        title: "Support (Beta)",
        description:
          "Entrez en contact avec notre équipe en cliquant sur le bouton qui correspond à votre demande.\n\n" +
          "**Partenariat**\n" +
          "Gagnez en visibilité et montez vos projets à nos côtés.\n\n" +
          "**Recrutement**\n" +
          "Rejoignez notre équipe de bénévoles et de passionnés pour monter en compétences, participer à des projets à fort potentiel, rejoindre une équipe jeune et dynamique, réaliser un stage dans le cadre de vos études ou tenter votre chance dans le monde du travail et surtout prendre du plaisir à exercer votre passion !",
        footer: {
          text: APP.NAME,
          icon_url: APP.LOGO,
        },
      };

      const messagesWithSameContent = messages.filter(
        (message) =>
          message.embeds[0]?.description === instructionEmbed.description &&
          message.embeds[0]?.title === instructionEmbed.title
      );

      if (messagesWithSameContent.size === 0) {
        // add buttons to the embed message
        await Promise.all(
          messages.map(async (message) => await message.delete())
        );

        textChannel.send({
          embeds: [instructionEmbed],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: ButtonStyle.Primary,
                  label: "🤝 Partenariat",
                  custom_id: "ticket_partner",
                },
                {
                  type: 2,
                  style: ButtonStyle.Primary,
                  label: "📥 Recrutement",
                  custom_id: "ticket_recruitment",
                },
              ],
            },
          ],
        });
      }
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("ticket_")) return;
    if (!interaction.guild) return;

    await interaction.deferReply();

    if (interaction.customId === "ticket_close") {
      await closeTicket(interaction);
      await interaction.deleteReply();
      return;
    }

    await addTicket(
      interaction.guild,
      interaction.user,
      interaction.customId.split("_")[1] as TicketType
    );

    await interaction.deleteReply();
  });
};

export default TicketPlugin;
