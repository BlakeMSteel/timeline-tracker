import { upgradeStoredCase } from "./db";
import { descriptionsForEveryScene } from "./scenes";
import {
  caseTitle,
  type Actor,
  type Case,
  type SceneDescription,
} from "./types";

const CASE_FILE_FORMAT = "timeline-tracker-case";
const CASE_FILE_VERSION = 1;
const DOWNLOAD_URL_LIFETIME_MS = 10_000;

type ActorWithImageDataUrl = Omit<Actor, "image"> & { image?: string };

type CaseWithImageDataUrls = Omit<
  Case,
  "map" | "actors" | "sceneDescriptions"
> & {
  map: Omit<Case["map"], "image"> & { image: string | null };
  actors: ActorWithImageDataUrl[];
  sceneDescriptions?: SceneDescription[];
};

interface CaseFile {
  format: typeof CASE_FILE_FORMAT;
  version: number;
  case: CaseWithImageDataUrls;
}

export class InvalidCaseFileError extends Error {}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

function fileNameFor(c: Case): string {
  const slug = caseTitle(c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "case"}.json`;
}

export async function serializeCase(c: Case): Promise<string> {
  const file: CaseFile = {
    format: CASE_FILE_FORMAT,
    version: CASE_FILE_VERSION,
    case: {
      ...c,
      sceneDescriptions: descriptionsForEveryScene(c),
      map: {
        ...c.map,
        image: c.map.image ? await blobToDataUrl(c.map.image) : null,
      },
      actors: await Promise.all(
        c.actors.map(async ({ image, ...actor }) => ({
          ...actor,
          ...(image && { image: await blobToDataUrl(image) }),
        })),
      ),
    },
  };
  return JSON.stringify(file, null, 2);
}

export async function downloadCaseFile(c: Case): Promise<void> {
  const url = URL.createObjectURL(
    new Blob([await serializeCase(c)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = fileNameFor(c);
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_LIFETIME_MS);
}

function isCaseFile(value: unknown): value is CaseFile {
  if (typeof value !== "object" || value === null) return false;
  const file = value as Partial<CaseFile>;
  const c = file.case;
  return (
    file.format === CASE_FILE_FORMAT &&
    typeof c === "object" &&
    c !== null &&
    typeof c.map === "object" &&
    c.map !== null &&
    Array.isArray(c.locations) &&
    Array.isArray(c.actors)
  );
}

export async function readCaseFile(
  file: Pick<File, "name" | "text">,
): Promise<Case> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new InvalidCaseFileError(`${file.name} isn't valid JSON.`);
  }
  if (!isCaseFile(parsed))
    throw new InvalidCaseFileError(
      `${file.name} isn't a Timeline Tracker case file.`,
    );
  if (parsed.version > CASE_FILE_VERSION)
    throw new InvalidCaseFileError(
      `${file.name} was made by a newer version of Timeline Tracker.`,
    );

  const { map, actors, sceneDescriptions, ...rest } = parsed.case;
  return upgradeStoredCase({
    ...rest,
    id: crypto.randomUUID(),
    sceneDescriptions: sceneDescriptions?.filter((d) => d.text !== ""),
    map: {
      name: map.name ?? "",
      description: map.description ?? "",
      image: map.image ? await dataUrlToBlob(map.image) : null,
    },
    actors: await Promise.all(
      actors.map(async ({ image, ...actor }) => ({
        ...actor,
        ...(image && { image: await dataUrlToBlob(image) }),
      })),
    ),
    updatedAt: Date.now(),
  });
}
