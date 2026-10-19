import { useEffect, useState } from "react";

/** Returns a temporary URL for displaying a Blob, revoked when the Blob changes or the component unmounts. */
export function useObjectUrl(blob: Blob | null): string | null {
  const [entry, setEntry] = useState<{ blob: Blob; url: string } | null>(null);

  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    // The URL must be created and revoked in the same effect so StrictMode's double-run can't revoke a live URL.
    // oxlint-disable-next-line react/set-state-in-effect
    setEntry({ blob, url });
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  // Ignore a stale URL from a previous Blob until the effect catches up.
  return entry && entry.blob === blob ? entry.url : null;
}
