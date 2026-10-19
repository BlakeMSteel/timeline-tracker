import type { MouseEvent, ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { useObjectUrl } from "../cases/useObjectUrl";

interface MapCanvasProps {
  image: Blob | null;
  alt: string;
  /** Called with the clicked point as fractions (0–1) of the image size. */
  onPick?: (x: number, y: number) => void;
  /** Overlay content, positioned with percentages of the image. */
  children?: ReactNode;
}

/** A map image with an overlay layer that lines up with the image exactly. */
export default function MapCanvas({
  image,
  alt,
  onPick,
  children,
}: MapCanvasProps) {
  const url = useObjectUrl(image);

  if (!image) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          aspectRatio: "4 / 3",
          border: 1,
          borderStyle: "dashed",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "grey.50",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No map image
        </Typography>
      </Box>
    );
  }

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!onPick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onPick(
      (e.clientX - rect.left) / rect.width,
      (e.clientY - rect.top) / rect.height,
    );
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          position: "relative",
          display: "inline-block",
          lineHeight: 0,
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        {url && (
          <Box
            component="img"
            src={url}
            alt={alt}
            draggable={false}
            sx={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "70vh",
              userSelect: "none",
            }}
          />
        )}
        <Box
          onClick={handleClick}
          sx={{
            position: "absolute",
            inset: 0,
            lineHeight: 1.5,
            cursor: onPick ? "crosshair" : "default",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

/** Positions its children centered on a point of the map. */
export function MapPoint({
  x,
  y,
  offset = [0, 0],
  children,
}: {
  x: number;
  y: number;
  /** Extra shift in pixels, for spreading out markers at the same point. */
  offset?: [number, number];
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: `translate(-50%, -50%) translate(${offset[0]}px, ${offset[1]}px)`,
        transition: "left 0.4s, top 0.4s, transform 0.4s",
      }}
    >
      {children}
    </Box>
  );
}

/** A place marker: a dark dot with its name underneath. */
export function PlacePin({
  name,
  selected = false,
}: {
  name: string;
  selected?: boolean;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        width: 14,
        height: 14,
        borderRadius: "50%",
        bgcolor: selected ? "primary.main" : "grey.900",
        border: 2,
        borderColor: "common.white",
        boxShadow: 2,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          px: 0.5,
          whiteSpace: "nowrap",
          fontWeight: 600,
          lineHeight: 1.4,
          color: "common.white",
          bgcolor: "rgba(0, 0, 0, 0.65)",
          borderRadius: 0.5,
          pointerEvents: "none",
        }}
      >
        {name || "Unnamed place"}
      </Typography>
    </Box>
  );
}
