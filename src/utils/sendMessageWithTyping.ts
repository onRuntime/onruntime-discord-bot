import { DMChannel, Message, TextChannel } from "discord.js";
const sendMessageWithTyping = (channel: TextChannel | DMChannel, text: any): Promise<Message> => {
    return new Promise((resolve) => {
        channel.startTyping();
        channel.send(text)
            .then((message: Message) => resolve(message))
            .then(() => channel.stopTyping());
    });
}

export default sendMessageWithTyping;