export const formatDurationBySecond = (second: number = 0) => {
  const hours = Math.floor(second / 3600);
  const minutes = Math.floor((second % 3600) / 60);
  const seconds = second % 60;

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟`;
  } else {
    return `${seconds}秒`;
  }
};

export const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return /^https?:$/i.test(parsed.protocol) && Boolean(parsed.hostname);
  } catch (e) {
    return false;
  }
};

export const formatDistance = (meters: number | string) => {
  if (typeof meters === 'string') {
    meters = parseFloat(meters);
  }
  if (meters >= 1000) {
    const km = meters / 1000;
    return `${km.toFixed(1)}km`;
  }
  return `${Math.round(meters)}m`;
};
