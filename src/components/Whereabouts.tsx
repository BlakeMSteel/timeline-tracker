import { Box, Stack, Typography } from "@mui/material";
import {
  activityAt,
  formatTime,
  lastActivityEndedBy,
  sortedActivities,
} from "../cases/time";
import type { Actor, Location } from "../cases/types";

export default function Whereabouts({
  actors,
  locations,
  time,
}: {
  actors: Actor[];
  locations: Location[];
  time: number;
}) {
  const placeName = (id: string) =>
    locations.find((l) => l.id === id)?.name || "an unknown place";

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Whereabouts at {formatTime(time)}
      </Typography>
      {actors.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No actors shown.
        </Typography>
      )}
      {actors.map((actor) => {
        const current = activityAt(actor, time);
        const last = current ? null : lastActivityEndedBy(actor, time);
        const next = current
          ? null
          : sortedActivities(actor).find((a) => a.start > time);
        return (
          <Box
            key={actor.id}
            sx={{
              pl: 1.5,
              borderLeft: 4,
              borderColor: current ? actor.color : "grey.400",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {actor.name || "Unnamed actor"}
            </Typography>
            {current ? (
              <>
                <Typography variant="body2">
                  At {placeName(current.locationId)} until{" "}
                  {formatTime(current.end)}
                </Typography>
                {current.description && (
                  <Typography variant="body2" color="text.secondary">
                    {current.description}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <Typography variant="body2" color="error">
                  Unaccounted for
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {last
                    ? `Last seen at ${placeName(last.locationId)}, left ${formatTime(last.end)}`
                    : "Not seen yet"}
                  {next &&
                    ` · Next at ${placeName(next.locationId)}, ${formatTime(next.start)}`}
                </Typography>
              </>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}
