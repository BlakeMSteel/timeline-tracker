import { convertLegacyDurationsToEnds } from "./db";
import { caseTitle, type Case } from "./types";

const CASE_FILE_FORMAT = "timeline-tracker-case";
const CASE_FILE_VERSION = 1;
const DOWNLOAD_URL_LIFETIME_MS = 10_000;

type CaseWithImageDataUrl = Omit<Case, "map"> & {
  map: Omit<Case["map"], "image"> & { image: string | null };
};

interface CaseFile {
  format: typeof CASE_FILE_FORMAT;
  version: number;
  case: CaseWithImageDataUrl;
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

export async function downloadCaseFile(c: Case): Promise<void> {
  const file: CaseFile = {
    format: CASE_FILE_FORMAT,
    version: CASE_FILE_VERSION,
    case: {
      ...c,
      map: {
        ...c.map,
        image: c.map.image ? await blobToDataUrl(c.map.image) : null,
      },
    },
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }),
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

export async function readCaseFile(file: File): Promise<Case> {
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

  const { map, ...rest } = parsed.case;
  return convertLegacyDurationsToEnds({
    ...rest,
    id: crypto.randomUUID(),
    map: {
      name: map.name ?? "",
      description: map.description ?? "",
      image: map.image ? await dataUrlToBlob(map.image) : null,
    },
    updatedAt: Date.now(),
  });
}
