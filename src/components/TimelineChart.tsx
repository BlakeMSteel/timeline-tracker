import type { MouseEvent } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import {
  activityEnd,
  formatDuration,
  formatTime,
  sortedActivities,
} from "../cases/time";
import type { Actor, Location } from "../cases/types";

interface TimelineChartProps {
  actors: Actor[];
  locations: Location[];
  range: [number, number];
  time: number;
  onTimeChange: (time: number) => void;
}

const LABEL_WIDTH = 120;
const ROW_HEIGHT = 32;

/** One row per actor across the day, with a bar for each activity. Click to move the scrubber. */
export default function TimelineChart({
  actors,
  locations,
  range,
  time,
  onTimeChange,
}: TimelineChartProps) {
  const [from, to] = range;
  const pct = (minutes: number) => ((minutes - from) / (to - from)) * 100;
  const placeName = (id: string) =>
    locations.find((l) => l.id === id)?.name || "No place";
  const hours: number[] = [];
  for (let h = from; h <= to; h += 60) hours.push(h);
  // Label every hour when there's room, otherwise every few.
  const labelEvery = Math.ceil(hours.length / 12);

  const handleTrackClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    onTimeChange(Math.round((from + fraction * (to - from)) / 5) * 5);
  };

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box
        sx={{
          minWidth: 560,
          display: "grid",
          gridTemplateColumns: `${LABEL_WIDTH}px 1fr`,
        }}
      >
        <Box />
        <Box sx={{ position: "relative", height: 20 }}>
          {hours.map((h, i) =>
            i % labelEvery === 0 ? (
              <Typography
                key={h}
                variant="caption"
                color="text.secondary"
                sx={{
                  position: "absolute",
                  left: `${pct(h)}%`,
                  transform:
                    i === 0
                      ? "none"
                      : i === hours.length - 1
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                }}
              >
                {formatTime(h).slice(0, 5)}
              </Typography>
            ) : null,
          )}
        </Box>

        {actors.map((actor) => (
          <Box key={actor.id} sx={{ display: "contents" }}>
            <Typography
              variant="body2"
              noWrap
              sx={{
                height: ROW_HEIGHT,
                lineHeight: `${ROW_HEIGHT}px`,
                pr: 1,
                fontWeight: 600,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              {actor.name || "Unnamed actor"}
            </Typography>
            <Box
              onClick={handleTrackClick}
              sx={{
                position: "relative",
                height: ROW_HEIGHT,
                borderTop: 1,
                borderColor: "divider",
                cursor: "pointer",
                // Faint stripes mark time nobody can account for.
                backgroundImage:
                  "repeating-linear-gradient(135deg, rgba(0,0,0,0.04) 0 4px, transparent 4px 8px)",
              }}
            >
              {hours.map((h) => (
                <Box
                  key={h}
                  sx={{
                    position: "absolute",
                    left: `${pct(h)}%`,
                    top: 0,
                    bottom: 0,
                    borderLeft: 1,
                    borderColor: "divider",
                  }}
                />
              ))}
              {sortedActivities(actor).map((a) => (
                <Tooltip
                  key={a.id}
                  title={
                    <>
                      <b>
                        {formatTime(a.start)} – {formatTime(activityEnd(a))}
                      </b>{" "}
                      ({formatDuration(a.duration)})
                      <br />
                      {placeName(a.locationId)}
                      {a.description && (
                        <>
                          <br />
                          {a.description}
                        </>
                      )}
                    </>
                  }
                >
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      onTimeChange(a.start);
                    }}
                    sx={{
                      position: "absolute",
                      top: 4,
                      bottom: 4,
                      left: `${pct(a.start)}%`,
                      width: `${pct(activityEnd(a)) - pct(a.start)}%`,
                      minWidth: 3,
                      px: 0.5,
                      bgcolor: actor.color,
                      color: "common.white",
                      borderRadius: 0.5,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      fontSize: 12,
                      lineHeight: `${ROW_HEIGHT - 8}px`,
                    }}
                  >
                    {placeName(a.locationId)}
                  </Box>
                </Tooltip>
              ))}
              <Box
                sx={{
                  position: "absolute",
                  left: `${pct(time)}%`,
                  top: 0,
                  bottom: 0,
                  borderLeft: 2,
                  borderColor: "text.primary",
                  pointerEvents: "none",
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
