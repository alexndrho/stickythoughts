import { secondsToMinutes } from 'date-fns';

const formatTime = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
});

const formatDayTime = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
});

const formatDateTime = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
});

export const getFormattedDate = (date: Date | string) => {
  const parsedDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return '-';

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneWeekAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

  if (parsedDate > today) {
    return formatTime.format(parsedDate);
  } else if (parsedDate > oneWeekAgo) {
    return formatDayTime.format(parsedDate);
  } else {
    return formatDateTime.format(parsedDate);
  }
};

export const secondsToMinutesExtended = (seconds: number): string => {
  const minutes = secondsToMinutes(seconds);
  const secondsLeft = seconds - minutes * 60;

  if (minutes > 0) {
    // m:ss seconds always padded when minutes > 0
    return `${minutes}:${String(secondsLeft).padStart(2, '0')}`;
  }

  // Under 1 minute: just show seconds
  return String(secondsLeft);
};
