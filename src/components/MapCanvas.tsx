import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Box, Typography } from "@mui/material";
import { locationIcon } from "../cases/locationIcons";
import { useObjectUrl } from "../cases/useObjectUrl";

const PIN_SIZE = 26;

interface MapCanvasProps {
  image: Blob | null;
  alt: string;
  /** Scale the image to fit the parent's height as well as its width. The parent needs a definite height. */
  fill?: boolean;
  /** Called with the clicked point as fractions (0–1) of the image size. */
  onPick?: (x: number, y: number) => void;
  /** Overlay content, positioned with percentages of the image. */
  children?: ReactNode;
}

interface Size {
  width: number;
  height: number;
}

/** A map image with an overlay layer that lines up with the image exactly. */
export default function MapCanvas({
  image,
  alt,
  fill = false,
  onPick,
  children,
}: MapCanvasProps) {
  const url = useObjectUrl(image);
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Size | null>(null);
  const [natural, setNatural] = useState<Size | null>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!fill || !el) return;
    const observer = new ResizeObserver(([entry]) =>
      setBox({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fill, url]);

  if (!image) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          aspectRatio: fill ? undefined : "4 / 3",
          flex: fill ? 1 : undefined,
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

  // In fill mode the image is sized explicitly to fit the available box, keeping its aspect ratio.
  const scale =
    fill && box && natural
      ? Math.min(box.width / natural.width, box.height / natural.height)
      : null;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!onPick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onPick(
      (e.clientX - rect.left) / rect.width,
      (e.clientY - rect.top) / rect.height,
    );
  };

  return (
    <Box
      ref={boxRef}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        ...(fill && { flex: 1, minHeight: 0, overflow: "hidden" }),
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "inline-block",
          lineHeight: 0,
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
            onLoad={(e) =>
              setNatural({
                width: e.currentTarget.naturalWidth,
                height: e.currentTarget.naturalHeight,
              })
            }
            sx={{
              display: "block",
              userSelect: "none",
              ...(scale !== null
                ? {
                    width: natural!.width * scale,
                    height: natural!.height * scale,
                  }
                : fill
                  ? {
                      maxWidth: "100%",
                      maxHeight: "100%",
                      visibility: "hidden",
                    }
                  : { maxWidth: "100%", maxHeight: "70vh" }),
            }}
          />
        )}
        <Box
          onClick={handleClick}
          sx={{
            position: "absolute",
            inset: 0,
            lineHeight: 1.5,
            borderRadius: 1,
            // Drawn over the image as an inset shadow, so the border doesn't change the image's size.
            boxShadow: (theme) => `0 0 0 1px ${theme.palette.divider} inset`,
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

/** A place marker: its icon in a dark circle, with its name underneath. */
export function PlacePin({
  name,
  icon,
  selected = false,
}: {
  name: string;
  icon?: string;
  selected?: boolean;
}) {
  const { Icon } = locationIcon(icon);
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: PIN_SIZE,
        height: PIN_SIZE,
        borderRadius: "50%",
        bgcolor: selected ? "primary.main" : "grey.900",
        color: "common.white",
        border: 2,
        borderColor: "common.white",
        boxShadow: 2,
      }}
    >
      <Icon sx={{ fontSize: 15 }} />
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          top: PIN_SIZE,
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
