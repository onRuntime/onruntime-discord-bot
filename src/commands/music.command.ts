import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import {
  ArgsOf,
  ButtonComponent,
  Discord,
  On,
  Slash,
  SlashGroup,
  SlashOption,
} from "discordx";
import { Player, Queue } from "./music";

@Discord()
@SlashGroup({ description: "music", name: "music" })
@SlashGroup("music")
export class MusicCommand {
  private player: Player;

  constructor() {
    this.player = new Player();
  }

  @On()
  voiceStateUpdate([oldState, newState]: ArgsOf<"voiceStateUpdate">): void {
    const queue = this.player.getQueue(oldState.guild);

    if (
      !queue.isReady ||
      !queue.voiceChannelId ||
      (oldState.channelId != queue.voiceChannelId &&
        newState.channelId != queue.voiceChannelId) ||
      !queue.channel
    ) {
      return;
    }

    const channel =
      oldState.channelId === queue.voiceChannelId
        ? oldState.channel
        : newState.channel;

    if (!channel) {
      return;
    }

    const totalMembers = channel.members.filter((m) => !m.user.bot);

    if (queue.isPlaying && !totalMembers.size) {
      queue.pause();
      queue.channel.send(
        "> To save resources, I have paused the queue since everyone has left my voice channel."
      );

      if (queue.timeoutTimer) {
        clearTimeout(queue.timeoutTimer);
      }

      queue.timeoutTimer = setTimeout(() => {
        queue.channel?.send(
          "> My voice channel has been open for 5 minutes and no one has joined, so the queue has been deleted."
        );
        queue.leave();
      }, 5 * 60 * 1000);
    } else if (queue.isPause && totalMembers.size) {
      if (queue.timeoutTimer) {
        clearTimeout(queue.timeoutTimer);
        queue.timeoutTimer = undefined;
      }
      queue.resume();
      queue.channel.send(
        "> There has been a new participant in my voice channel, and the queue will be resumed. Enjoy the music 🎶"
      );
    }
  }

  validateControlInteraction(
    interaction: CommandInteraction
  ): Queue | undefined {
    if (
      !interaction.guild ||
      !interaction.channel ||
      !(interaction.member instanceof GuildMember)
    ) {
      interaction.reply(
        "> Your request could not be processed, please try again later"
      );
      return;
    }

    const queue = this.player.getQueue(interaction.guild, interaction.channel);

    if (interaction.member.voice.channelId !== queue.voiceChannelId) {
      interaction.reply(
        "> To use the controls, you need to join the bot voice channel"
      );

      setTimeout(() => interaction.deleteReply(), 15e3);
      return;
    }

    return queue;
  }

  @ButtonComponent({ id: "btn-next" })
  async nextControl(interaction: CommandInteraction): Promise<void> {
    const queue = this.validateControlInteraction(interaction);
    if (!queue) {
      return;
    }
    queue.skip();
    await interaction.deferReply();
    interaction.deleteReply();
  }

  @ButtonComponent({ id: "btn-pause" })
  async pauseControl(interaction: CommandInteraction): Promise<void> {
    const queue = this.validateControlInteraction(interaction);
    if (!queue) {
      return;
    }
    queue.isPause ? queue.resume() : queue.pause();
    await interaction.deferReply();
    interaction.deleteReply();
  }

  @ButtonComponent({ id: "btn-leave" })
  async leaveControl(interaction: CommandInteraction): Promise<void> {
    const queue = this.validateControlInteraction(interaction);
    if (!queue) {
      return;
    }
    queue.leave();
    await interaction.deferReply();
    interaction.deleteReply();
  }

  @ButtonComponent({ id: "btn-repeat" })
  async repeatControl(interaction: CommandInteraction): Promise<void> {
    const queue = this.validateControlInteraction(interaction);
    if (!queue) {
      return;
    }
    queue.setRepeat(!queue.repeat);
    await interaction.deferReply();
    interaction.deleteReply();
  }

  @ButtonComponent({ id: "btn-loop" })
  async loopControl(interaction: CommandInteraction): Promise<void> {
    const queue = this.validateControlInteraction(interaction);
    if (!queue) {
      return;
    }
    queue.setLoop(!queue.loop);
    await interaction.deferReply();
    interaction.deleteReply();
  }

  @ButtonComponent({ id: "btn-queue" })
  queueControl(interaction: CommandInteraction): void {
    const queue = this.validateControlInteraction(interaction);
    if (!queue) {
      return;
    }
    queue.view(interaction);
  }

  async processJoin(
    interaction: CommandInteraction
  ): Promise<Queue | undefined> {
    if (
      !interaction.guild ||
      !interaction.channel ||
      !(interaction.member instanceof GuildMember)
    ) {
      interaction.reply(
        "> Your request could not be processed, please try again later"
      );

      setTimeout(() => interaction.deleteReply(), 15e3);
      return;
    }

    if (
      !(interaction.member instanceof GuildMember) ||
      !interaction.member.voice.channel
    ) {
      interaction.reply("> You are not in the voice channel");

      setTimeout(() => interaction.deleteReply(), 15e3);
      return;
    }

    await interaction.deferReply();
    const queue = this.player.getQueue(interaction.guild, interaction.channel);

    if (!queue.isReady) {
      queue.channel = interaction.channel;
      await queue.join(interaction.member.voice.channel);
    }

    return queue;
  }

  @Slash({ description: "Play a song" })
  async play(
    @SlashOption({
      description: "song url or title",
      name: "song",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    songName: string,
    interaction: CommandInteraction
  ): Promise<void> {
    const queue = await this.processJoin(interaction);
    if (!queue) {
      return;
    }
    const song = await queue.play(songName, { user: interaction.user });
    if (!song) {
      interaction.followUp("The song could not be found");
    } else {
      const embed = new EmbedBuilder();
      embed.setTitle("Enqueued");
      embed.setDescription(`Enqueued song **${song.title}****`);
      interaction.followUp({ embeds: [embed] });
    }
  }
}
