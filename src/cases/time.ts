import type { Activity, Actor, MinutesFromMidnight } from "./types";

const MINUTES_PER_DAY = 1440;

const pad = (n: number) => String(n).padStart(2, "0");

const clockMinutes = (minutes: MinutesFromMidnight) =>
  ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

const hoursAndMinutes = (minutes: MinutesFromMidnight) => {
  const m = clockMinutes(minutes);
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
};

export function formatTime(minutes: MinutesFromMidnight): string {
  const daysLater = Math.floor(minutes / MINUTES_PER_DAY);
  const text = hoursAndMinutes(minutes);
  return daysLater > 0 ? `${text} (+${daysLater})` : text;
}

export const toTimeInputValue = hoursAndMinutes;

export function fromTimeInputValue(value: string): MinutesFromMidnight | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function isNextDay(minutes: MinutesFromMidnight): boolean {
  return minutes >= MINUTES_PER_DAY;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function nextOccurrenceAfter(
  start: MinutesFromMidnight,
  clockTime: MinutesFromMidnight,
): MinutesFromMidnight {
  const clock = clockMinutes(clockTime);
  return clock > start ? clock : clock + MINUTES_PER_DAY;
}

export function sortedActivities(actor: Actor): Activity[] {
  return [...actor.activities].sort((a, b) => a.start - b.start);
}

export function activityAt(
  actor: Actor,
  time: MinutesFromMidnight,
): Activity | null {
  return (
    sortedActivities(actor).find((a) => a.start <= time && time < a.end) ?? null
  );
}

export function lastActivityEndedBy(
  actor: Actor,
  time: MinutesFromMidnight,
): Activity | null {
  const ended = sortedActivities(actor).filter((a) => a.end <= time);
  return ended.length ? ended.reduce((a, b) => (b.end > a.end ? b : a)) : null;
}

export function overlappingActivityIds(actor: Actor): Set<string> {
  const ids = new Set<string>();
  const sorted = sortedActivities(actor);
  sorted.forEach((a, i) => {
    for (const b of sorted.slice(i + 1)) {
      if (b.start >= a.end) break;
      ids.add(a.id);
      ids.add(b.id);
    }
  });
  return ids;
}

export function wholeHoursCoveringActivities(
  actors: Actor[],
): [MinutesFromMidnight, MinutesFromMidnight] {
  const all = actors.flatMap((a) => a.activities);
  if (all.length === 0) return [0, MINUTES_PER_DAY];
  const earliestStart = Math.min(...all.map((a) => a.start));
  const latestEnd = Math.max(...all.map((a) => a.end));
  const from = Math.floor(earliestStart / 60) * 60;
  return [from, Math.max(from + 60, Math.ceil(latestEnd / 60) * 60)];
}
