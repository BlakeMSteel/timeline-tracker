import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Box, Typography } from "@mui/material";
import {
  locationIconOrDefault,
  type LocationIconKey,
} from "../cases/locationIcons";
import type { FractionOfImageSize } from "../cases/types";
import { useObjectUrl } from "../cases/useObjectUrl";

const PIN_SIZE = 26;

interface MapCanvasProps {
  image: Blob | null;
  alt: string;
  fitToParentHeight?: boolean;
  onPickPoint?: (x: FractionOfImageSize, y: FractionOfImageSize) => void;
  children?: ReactNode;
}

interface Size {
  width: number;
  height: number;
}

export default function MapCanvas({
  image,
  alt,
  fitToParentHeight = false,
  onPickPoint,
  children,
}: MapCanvasProps) {
  const url = useObjectUrl(image);
  const availableAreaRef = useRef<HTMLDivElement>(null);
  const [availableSize, setAvailableSize] = useState<Size | null>(null);
  const [naturalImageSize, setNaturalImageSize] = useState<Size | null>(null);

  useEffect(() => {
    const el = availableAreaRef.current;
    if (!fitToParentHeight || !el) return;
    const observer = new ResizeObserver(([entry]) =>
      setAvailableSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fitToParentHeight, url]);

  if (!image) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          aspectRatio: fitToParentHeight ? undefined : "4 / 3",
          flex: fitToParentHeight ? 1 : undefined,
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

  const scaleToFitAvailableSize =
    fitToParentHeight && availableSize && naturalImageSize
      ? Math.min(
          availableSize.width / naturalImageSize.width,
          availableSize.height / naturalImageSize.height,
        )
      : null;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!onPickPoint) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onPickPoint(
      (e.clientX - rect.left) / rect.width,
      (e.clientY - rect.top) / rect.height,
    );
  };

  return (
    <Box
      ref={availableAreaRef}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        ...(fitToParentHeight && { flex: 1, minHeight: 0, overflow: "hidden" }),
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
              setNaturalImageSize({
                width: e.currentTarget.naturalWidth,
                height: e.currentTarget.naturalHeight,
              })
            }
            sx={{
              display: "block",
              userSelect: "none",
              ...(scaleToFitAvailableSize !== null
                ? {
                    width: naturalImageSize!.width * scaleToFitAvailableSize,
                    height: naturalImageSize!.height * scaleToFitAvailableSize,
                  }
                : fitToParentHeight
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
            boxShadow: (theme) => `0 0 0 1px ${theme.palette.divider} inset`,
            cursor: onPickPoint ? "crosshair" : "default",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export function MapPoint({
  x,
  y,
  pixelOffset = [0, 0],
  children,
}: {
  x: FractionOfImageSize;
  y: FractionOfImageSize;
  pixelOffset?: [number, number];
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: `translate(-50%, -50%) translate(${pixelOffset[0]}px, ${pixelOffset[1]}px)`,
        transition: "left 0.4s, top 0.4s, transform 0.4s",
      }}
    >
      {children}
    </Box>
  );
}

export function PlacePin({
  name,
  icon,
  selected = false,
}: {
  name: string;
  icon?: LocationIconKey;
  selected?: boolean;
}) {
  const { Icon } = locationIconOrDefault(icon);
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
