import type { Activity, Actor } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Minutes from midnight as "HH:MM", with "+1" for times past midnight of the next day. */
export function formatTime(minutes: number): string {
  const day = Math.floor(minutes / 1440);
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const text = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  return day > 0 ? `${text} (+${day})` : text;
}

/** Minutes from midnight as the "HH:MM" value of an <input type="time">. */
export function toTimeInput(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

export function fromTimeInput(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export const activityEnd = (a: Activity) => a.start + a.duration;

export function sortedActivities(actor: Actor): Activity[] {
  return [...actor.activities].sort((a, b) => a.start - b.start);
}

/** The activity an actor is doing at a time, or null when they're unaccounted for. */
export function activityAt(actor: Actor, time: number): Activity | null {
  return (
    sortedActivities(actor).find(
      (a) => a.start <= time && time < activityEnd(a),
    ) ?? null
  );
}

/** The most recent activity that ended at or before a time. */
export function lastActivityBefore(
  actor: Actor,
  time: number,
): Activity | null {
  const past = sortedActivities(actor).filter((a) => activityEnd(a) <= time);
  return past.length
    ? past.reduce((a, b) => (activityEnd(b) > activityEnd(a) ? b : a))
    : null;
}

/** Pairs of an actor's activities whose times overlap — they can't be in two places at once. */
export function overlappingIds(actor: Actor): Set<string> {
  const ids = new Set<string>();
  const sorted = sortedActivities(actor);
  sorted.forEach((a, i) => {
    for (const b of sorted.slice(i + 1)) {
      if (b.start >= activityEnd(a)) break;
      ids.add(a.id);
      ids.add(b.id);
    }
  });
  return ids;
}

/** Whole hours covering every activity, or the full day when there are none. */
export function timeRange(actors: Actor[]): [number, number] {
  const all = actors.flatMap((a) => a.activities);
  if (all.length === 0) return [0, 1440];
  const start = Math.min(...all.map((a) => a.start));
  const end = Math.max(...all.map(activityEnd));
  const from = Math.floor(start / 60) * 60;
  return [from, Math.max(from + 60, Math.ceil(end / 60) * 60)];
}
