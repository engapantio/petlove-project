import type { WorkDay } from '../types';

const HOURS_GAP = ' - ';

/**
 * Schedule chip: hours only (no weekday names). Missing / unusable → "Day and night".
 */
export const formatFriendHours = (workDays: WorkDay[] | null | undefined): string => {
  if (workDays == null || workDays.length === 0) {
    return 'Day and night';
  }

  const open = workDays.filter((d) => d.isOpen && d.from?.trim() && d.to?.trim());
  if (open.length === 0) {
    return 'Day and night';
  }

  const first = open[0];
  const uniform = open.every((d) => d.from === first.from && d.to === first.to);

  if (!uniform) {
    return 'Day and night';
  }

  return `${first.from}${HOURS_GAP}${first.to}`;
};
