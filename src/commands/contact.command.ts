import { EmbedBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
} from "discord.js";
import { Discord, ModalComponent, Slash } from "discordx";
import APP from "../constants/main";
import Log from "../utils/log";

@Discord()
export class ContactCommand {
  @Slash({ description: "Contact us through a litle form" })
  contact(interaction: CommandInteraction): void {
    const modal = new ModalBuilder()
      .setTitle("Contact Us!")
      .setCustomId("contactForm");

    const emailInputComponent = new TextInputBuilder()
      .setCustomId("email")
      .setLabel("Email")
      .setStyle(TextInputStyle.Short);

    const contentInputComponent = new TextInputBuilder()
      .setCustomId("content")
      .setLabel("What we can do for you?")
      .setStyle(TextInputStyle.Paragraph);

    const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(
      emailInputComponent
    );

    const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
      contentInputComponent
    );
    modal.addComponents(row1, row2);

    interaction.showModal(modal);
  }

  @ModalComponent()
  async contactForm(interaction: ModalSubmitInteraction): Promise<void> {
    const [email, content] = ["email", "content"].map((id) =>
      interaction.fields.getTextInputValue(id)
    );

    Log.info(`
      📦 - New Order!\n\n
        - Email: ${email}\n
        - Content:\n${content}
    `);
    const replyEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setAuthor({
        name: "Request sent!",
      })
      .setDescription(
        `Thank you for your interest in our work ${interaction.user}, you will receive an email soon!`
      )
      .setFooter({
        text: APP.NAME,
        iconURL: APP.LOGO,
      });

    (await interaction.user.createDM()).send({ embeds: [replyEmbed] });
    await interaction.deferReply();

    return;
  }
}
