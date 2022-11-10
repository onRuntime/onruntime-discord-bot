/**
 * Progress indicator is a simple string loading indicator like: ▰▱▱▱▱▱▱▱▱▱▱▱▱ 5%
 * It should avoid errors if percent is more than 100
 */
const progressIndicator = (percent: number) => {
  const barPercent = percent > 100 ? 100 : percent;
  const barLength = 10;
  const bar = "▰".repeat(Math.floor((barPercent / 100) * barLength));
  const emptyBar = "▱".repeat(barLength - bar.length);
  return `${bar}${emptyBar} ${Math.floor(percent)}%`;
};

export default progressIndicator;
