const formatEmoji = (emojiName: string, isGuildEmoji: boolean): string => {
    return isGuildEmoji ? `:${emojiName}:` : emojiName;
};

export default formatEmoji;