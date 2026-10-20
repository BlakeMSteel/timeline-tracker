import { useEffect, useState } from "react";

export function useObjectUrl(blob: Blob | null): string | null {
  const [entry, setEntry] = useState<{ blob: Blob; url: string } | null>(null);

  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    // oxlint-disable-next-line react/set-state-in-effect
    setEntry({ blob, url });
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  const entryMatchesBlob = entry !== null && entry.blob === blob;
  return entryMatchesBlob ? entry.url : null;
}
