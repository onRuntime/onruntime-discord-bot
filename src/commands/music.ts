import {
  Player as DiscordPlayer,
  Queue as DiscordQueue,
} from "@discordx/music";
import {
  Pagination,
  PaginationResolver,
  PaginationType,
} from "@discordx/pagination";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  ContextMenuCommandInteraction,
  EmbedBuilder,
  Guild,
  Message,
  MessageActionRowComponentBuilder,
  TextBasedChannel,
} from "discord.js";

export class Queue extends DiscordQueue {
  lastControlMessage?: Message;
  timeoutTimer?: NodeJS.Timeout;
  lockUpdate = false;

  get playbackMilliseconds(): number {
    const track = this.currentTrack;
    if (!track?.metadata.isYoutubeTrack() || !track.metadata.info.duration) {
      return 0;
    }

    return this.toMS(track.metadata.info.duration);
  }

  public fromMS(duration: number): string {
    const seconds = Math.floor((duration / 1e3) % 60);
    const minutes = Math.floor((duration / 6e4) % 60);
    const hours = Math.floor(duration / 36e5);
    const secondsPad = `${seconds}`.padStart(2, "0");
    const minutesPad = `${minutes}`.padStart(2, "0");
    const hoursPad = `${hours}`.padStart(2, "0");
    return `${hours ? `${hoursPad}:` : ""}${minutesPad}:${secondsPad}`;
  }

  public toMS(duration: string): number {
    const milliseconds =
      duration
        .split(":")
        .reduceRight(
          (prev, curr, i, arr) =>
            prev + parseInt(curr) * Math.pow(60, arr.length - 1 - i),
          0
        ) * 1e3;

    return milliseconds ? milliseconds : 0;
  }

  constructor(player: Player, guild: Guild, public channel?: TextBasedChannel) {
    super(player, guild);
    setInterval(() => this.updateControlMessage(), 1e4);
  }

  private controlsRow(): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
    const nextButton = new ButtonBuilder()
      .setLabel("Next")
      .setEmoji("⏭")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!this.isPlaying)
      .setCustomId("btn-next");

    const pauseButton = new ButtonBuilder()
      .setLabel(this.isPlaying ? "Pause" : "Resume")
      .setEmoji(this.isPlaying ? "⏸️" : "▶️")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("btn-pause");

    const repeatButton = new ButtonBuilder()
      .setLabel("Repeat")
      .setEmoji("🔂")
      .setDisabled(!this.isPlaying)
      .setStyle(this.repeat ? ButtonStyle.Danger : ButtonStyle.Primary)
      .setCustomId("btn-repeat");

    const loopButton = new ButtonBuilder()
      .setLabel("Loop")
      .setEmoji("🔁")
      .setDisabled(!this.isPlaying)
      .setStyle(this.loop ? ButtonStyle.Danger : ButtonStyle.Primary)
      .setCustomId("btn-loop");

    const queueButton = new ButtonBuilder()
      .setLabel("Queue")
      .setEmoji("🎵")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("btn-queue");

    const row1 =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        loopButton,
        pauseButton,
        nextButton,
        repeatButton,
        queueButton
      );

    const stopButton = new ButtonBuilder()
      .setLabel("Stop")
      .setStyle(ButtonStyle.Danger)
      .setCustomId("btn-leave");

    const row2 =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        stopButton
      );

    return [row1, row2];
  }

  public async updateControlMessage(options?: {
    force?: boolean;
    text?: string;
  }): Promise<void> {
    if (this.lockUpdate) {
      return;
    }
    this.lockUpdate = true;

    const embed = new EmbedBuilder();
    embed.setTitle("Music Controls");

    const currentTrack = this.currentTrack;
    const nextTrack = this.nextTrack;

    if (!currentTrack) {
      if (this.lastControlMessage) {
        await this.lastControlMessage.delete();

        this.lastControlMessage = undefined;
      }
      this.lockUpdate = false;
      return;
    }

    const user = currentTrack.metadata.isYoutubeTrack()
      ? currentTrack.metadata.options?.user
      : currentTrack.metadata?.user;

    embed.addFields({
      name:
        "Now Playing" +
        (this.size > 2 ? ` (Total: ${this.size} tracks queued)` : ""),
      value: `[${currentTrack.metadata.title}](${
        currentTrack.metadata.url ?? "NaN"
      })${user ? ` by ${user}` : ""}`,
    });

    const progressBarOptions = {
      arrow: "🔘",
      block: "━",
      size: 15,
    };

    if (currentTrack.metadata.isYoutubeTrack()) {
      const { size, arrow, block } = progressBarOptions;
      const timeNow = this.playbackDuration;
      const timeTotal = this.playbackMilliseconds;

      const progress = Math.round((size * timeNow) / timeTotal);
      const emptyProgress = size - progress;

      const progressString =
        block.repeat(progress) + arrow + block.repeat(emptyProgress);

      const bar = (this.isPlaying ? "▶️" : "⏸️") + " " + progressString;
      const currentTime = this.fromMS(timeNow);
      const endTime = this.fromMS(timeTotal);
      const spacing = bar.length - currentTime.length - endTime.length;
      const time =
        "`" + currentTime + " ".repeat(spacing * 3 - 2) + endTime + "`";

      embed.addFields({ name: bar, value: time });
    }

    if (
      currentTrack.metadata.isYoutubeTrack() &&
      currentTrack.metadata.info.bestThumbnail.url
    ) {
      embed.setThumbnail(currentTrack.metadata.info.bestThumbnail.url);
    }

    embed.addFields({
      name: "Next Song",
      value: nextTrack
        ? `[${nextTrack.title}](${nextTrack.url})`
        : "No upcoming song",
    });

    const pMsg = {
      components: [...this.controlsRow()],
      content: options?.text,
      embeds: [embed],
    };

    if (!this.isReady && this.lastControlMessage) {
      await this.lastControlMessage.delete();
      this.lastControlMessage = undefined;
      this.lockUpdate = false;
      return;
    }

    try {
      if (!this.lastControlMessage || options?.force) {
        if (this.lastControlMessage) {
          await this.lastControlMessage.delete();
          this.lastControlMessage = undefined;
        }
        this.lastControlMessage = await this.channel?.send(pMsg);
      } else {
        await this.lastControlMessage.edit(pMsg);
      }
    } catch (err) {
      console.log(err);
    }

    this.lockUpdate = false;
  }

  public async view(
    interaction: Message | CommandInteraction | ContextMenuCommandInteraction
  ): Promise<void> {
    const currentTrack = this.currentTrack;
    if (!this.isReady || !currentTrack) {
      const pMsg = await interaction.reply({
        content: "> could not process queue atm, try later!",
        ephemeral: true,
      });
      if (pMsg instanceof Message) {
        setTimeout(() => pMsg.delete(), 3000);
      }
      return;
    }

    if (!this.size) {
      const pMsg = await interaction.reply(
        `> Playing **${currentTrack.metadata.title}**`
      );
      if (pMsg instanceof Message) {
        setTimeout(() => pMsg.delete(), 1e4);
      }
      return;
    }

    const current = `> Playing **${currentTrack.metadata.title}** out of ${
      this.size + 1
    }`;

    const pageOptions = new PaginationResolver((index, paginator) => {
      paginator.maxLength = this.size / 10;
      if (index > paginator.maxLength) {
        paginator.currentPage = 0;
      }

      const currentPage = paginator.currentPage;

      const queue = this.tracks
        .slice(currentPage * 10, currentPage * 10 + 10)
        .map(
          (track, index1) =>
            `${currentPage * 10 + index1 + 1}. ${track.title}` +
            `${
              track.isYoutubeTrack() && track.info.duration
                ? ` (${track.info.duration})`
                : ""
            }`
        )
        .join("\n\n");

      return { content: `${current}\n\`\`\`markdown\n${queue}\`\`\`` };
    }, Math.round(this.size / 10));

    await new Pagination(interaction, pageOptions, {
      enableExit: true,
      onTimeout: (_, message) => {
        if (message.deletable) {
          message.delete();
        }
      },
      time: 6e4,
      type:
        Math.round(this.size / 10) <= 5
          ? PaginationType.Button
          : PaginationType.SelectMenu,
    }).send();
  }
}

export class Player extends DiscordPlayer {
  constructor() {
    super();

    this.on<Queue, "onStart">("onStart", ([queue]) => {
      queue.updateControlMessage({ force: true });
    });

    this.on<Queue, "onFinishPlayback">("onFinishPlayback", ([queue]) => {
      queue.leave();
    });

    this.on<Queue, "onPause">("onPause", ([queue]) => {
      queue.updateControlMessage();
    });

    this.on<Queue, "onResume">("onResume", ([queue]) => {
      queue.updateControlMessage();
    });

    this.on<Queue, "onError">("onError", ([queue, err]) => {
      queue.updateControlMessage({
        force: true,
        text: `Error: ${err.message}`,
      });
    });

    this.on<Queue, "onFinish">("onFinish", ([queue]) => {
      queue.updateControlMessage();
    });

    this.on<Queue, "onLoop">("onLoop", ([queue]) => {
      queue.updateControlMessage();
    });

    this.on<Queue, "onRepeat">("onRepeat", ([queue]) => {
      queue.updateControlMessage();
    });

    this.on<Queue, "onSkip">("onSkip", ([queue]) => {
      queue.updateControlMessage();
    });

    this.on<Queue, "onTrackAdd">("onTrackAdd", ([queue]) => {
      queue.updateControlMessage();
    });

    this.on<Queue, "onLoopEnabled">("onLoopEnabled", ([queue]) => {
      queue.updateControlMessage();
    });

    this.on<Queue, "onLoopDisabled">("onLoopDisabled", ([queue]) => {
      queue.updateControlMessage();
    });

    this.on<Queue, "onRepeatEnabled">("onRepeatEnabled", ([queue]) => {
      queue.updateControlMessage();
    });

    this.on<Queue, "onRepeatDisabled">("onRepeatDisabled", ([queue]) => {
      queue.updateControlMessage();
    });

    this.on<Queue, "onMix">("onMix", ([queue]) => {
      queue.updateControlMessage();
    });

    this.on<Queue, "onVolumeUpdate">("onVolumeUpdate", ([queue]) => {
      queue.updateControlMessage();
    });
  }

  getQueue(guild: Guild, channel?: TextBasedChannel): Queue {
    return super.queue<Queue>(guild, () => new Queue(this, guild, channel));
  }
}
