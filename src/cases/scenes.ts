import { dayBounds, formatTime } from "./time";
import type { Actor, Case, Location, SceneDescription } from "./types";

export interface Scene {
  locationId: string;
  start: number;
  end: number;
  actorIds: string[];
}

type SceneSpan = Pick<Scene, "locationId" | "start" | "end">;

export function sceneKey({ locationId, start, end }: SceneSpan): string {
  return `${locationId}:${start}-${end}`;
}

const sameActorSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id) => b.includes(id));

function scenesAtLocation(
  location: Location,
  actors: Actor[],
  [dayStart, dayEnd]: [number, number],
): Scene[] {
  const activitiesHere = actors.flatMap((actor) =>
    actor.activities.filter((a) => a.locationId === location.id),
  );
  const boundaries = [
    ...new Set([
      dayStart,
      dayEnd,
      ...activitiesHere.flatMap((a) => [a.start, a.end]),
    ]),
  ].sort((a, b) => a - b);

  const scenes: Scene[] = [];
  boundaries.slice(0, -1).forEach((start, i) => {
    const end = boundaries[i + 1];
    const actorIds = actors
      .filter((actor) =>
        actor.activities.some(
          (a) =>
            a.locationId === location.id && a.start <= start && a.end >= end,
        ),
      )
      .map((actor) => actor.id);
    const previous = scenes.at(-1);
    if (previous && sameActorSet(previous.actorIds, actorIds)) {
      previous.end = end;
    } else {
      scenes.push({ locationId: location.id, start, end, actorIds });
    }
  });
  return scenes;
}

export function deriveScenes(c: Pick<Case, "actors" | "locations">): Scene[] {
  const bounds = dayBounds(c.actors);
  if (!bounds) return [];
  return c.locations.flatMap((location) =>
    scenesAtLocation(location, c.actors, bounds),
  );
}

function scenesMatching(d: SceneDescription, scenes: Scene[]): Scene[] {
  const overlapping = scenes.filter(
    (s) => s.locationId === d.locationId && s.start < d.end && d.start < s.end,
  );
  const unchanged = overlapping.find(
    (s) =>
      s.start === d.start &&
      s.end === d.end &&
      sameActorSet(s.actorIds, d.actorIds),
  );
  if (unchanged) return [unchanged];

  const emptyScenes = overlapping.filter((s) => s.actorIds.length === 0);
  const relevant =
    d.actorIds.length > 0
      ? overlapping.filter((s) =>
          s.actorIds.some((id) => d.actorIds.includes(id)),
        )
      : emptyScenes.length > 0
        ? emptyScenes
        : overlapping;

  const withSameActors = relevant.filter((s) =>
    sameActorSet(s.actorIds, d.actorIds),
  );
  return withSameActors.length === 1 ? withSameActors : relevant;
}

function unattachedReason(d: SceneDescription, c: Case): string {
  if (!c.locations.some((l) => l.id === d.locationId))
    return "Its location was deleted";
  return d.actorIds.length > 0
    ? "Its actors are no longer at this location at this time"
    : "Its time is no longer part of the day";
}

function actorChangeNotes(
  d: SceneDescription,
  scene: Scene,
  actors: Actor[],
): string[] {
  const nameOf = (id: string) =>
    actors.find((a) => a.id === id)?.name || "An actor";
  return [
    ...d.actorIds
      .filter((id) => !scene.actorIds.includes(id))
      .map((id) => `${nameOf(id)} left`),
    ...scene.actorIds
      .filter((id) => !d.actorIds.includes(id))
      .map((id) => `${nameOf(id)} arrived`),
  ];
}

const unique = (notes: string[]) => [...new Set(notes)];

function combineTexts(first: string, second: string): string {
  return first === second ? first : `${first}\n\n${second}`;
}

function isSettled(c: Case, scenes: Scene[]): boolean {
  const attached = c.sceneDescriptions.filter((d) => d.attached);
  const keys = new Set(attached.map(sceneKey));
  return (
    keys.size === attached.length &&
    attached.every((d) => {
      const [match] = scenesMatching(d, scenes);
      return (
        match !== undefined &&
        match.start === d.start &&
        match.end === d.end &&
        sameActorSet(match.actorIds, d.actorIds)
      );
    })
  );
}

export function reconcileSceneDescriptions(c: Case): Case {
  const scenes = deriveScenes(c);
  if (isSettled(c, scenes)) return c;

  const unattached = c.sceneDescriptions.filter((d) => !d.attached);
  const placedBySceneKey = new Map<string, SceneDescription>();
  const inTimeOrder = c.sceneDescriptions
    .filter((d) => d.attached)
    .sort((a, b) => a.start - b.start);

  for (const d of inTimeOrder) {
    const targets = scenesMatching(d, scenes);
    if (targets.length === 0) {
      unattached.push({
        ...d,
        attached: false,
        reviewNotes: unique([...d.reviewNotes, unattachedReason(d, c)]),
      });
      continue;
    }
    targets.forEach((scene, i) => {
      const key = sceneKey(scene);
      const splitNote =
        targets.length > 1 ? [`Split into ${targets.length} scenes`] : [];
      const placed: SceneDescription = {
        ...d,
        id: i === 0 ? d.id : crypto.randomUUID(),
        ...scene,
        reviewNotes: unique([
          ...d.reviewNotes,
          ...splitNote,
          ...actorChangeNotes(d, scene, c.actors),
        ]),
      };
      const existing = placedBySceneKey.get(key);
      placedBySceneKey.set(
        key,
        existing
          ? {
              ...existing,
              text: combineTexts(existing.text, placed.text),
              reviewNotes: unique([
                ...existing.reviewNotes,
                ...placed.reviewNotes,
                "Descriptions from merged scenes were combined",
              ]),
            }
          : placed,
      );
    });
  }

  return {
    ...c,
    sceneDescriptions: [...placedBySceneKey.values(), ...unattached],
  };
}

export function sceneAt(
  scenes: Scene[],
  locationId: string,
  time: number,
): Scene | undefined {
  return scenes.find(
    (s) => s.locationId === locationId && s.start <= time && time < s.end,
  );
}

export function descriptionForScene(
  c: Case,
  scene: Scene,
): SceneDescription | undefined {
  const key = sceneKey(scene);
  return c.sceneDescriptions.find((d) => d.attached && sceneKey(d) === key);
}

export function setSceneDescriptionText(
  c: Case,
  scene: Scene,
  text: string,
): Case {
  const existing = descriptionForScene(c, scene);
  if (!text) {
    return {
      ...c,
      sceneDescriptions: c.sceneDescriptions.filter((d) => d !== existing),
    };
  }
  return {
    ...c,
    sceneDescriptions: existing
      ? c.sceneDescriptions.map((d) => (d === existing ? { ...d, text } : d))
      : [
          ...c.sceneDescriptions,
          {
            id: crypto.randomUUID(),
            ...scene,
            text,
            reviewNotes: [],
            attached: true,
          },
        ],
  };
}

export function attachDescriptionToScene(
  c: Case,
  descriptionId: string,
  scene: Scene,
): Case {
  const moving = c.sceneDescriptions.find((d) => d.id === descriptionId);
  if (!moving) return c;
  const others = c.sceneDescriptions.filter((d) => d !== moving);
  const existing = descriptionForScene(
    { ...c, sceneDescriptions: others },
    scene,
  );
  return {
    ...c,
    sceneDescriptions: existing
      ? others.map((d) =>
          d === existing
            ? { ...d, text: combineTexts(d.text, moving.text) }
            : d,
        )
      : [...others, { ...moving, ...scene, attached: true, reviewNotes: [] }],
  };
}

export function markDescriptionReviewed(c: Case, descriptionId: string): Case {
  return {
    ...c,
    sceneDescriptions: c.sceneDescriptions.map((d) =>
      d.id === descriptionId ? { ...d, reviewNotes: [] } : d,
    ),
  };
}

export function deleteDescription(c: Case, descriptionId: string): Case {
  return {
    ...c,
    sceneDescriptions: c.sceneDescriptions.filter(
      (d) => d.id !== descriptionId,
    ),
  };
}

export function sceneTimeLabel({ start, end }: SceneSpan): string {
  return `${formatTime(start)}–${formatTime(end)}`;
}
