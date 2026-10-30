import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import { locationIconOrDefault } from "../cases/locationIcons";
import { activityAt, formatTime } from "../cases/time";
import type {
  Activity,
  Actor,
  Location,
  MinutesFromMidnight,
} from "../cases/types";

interface Visit {
  actor: Actor;
  activity: Activity;
}

function actorsPresent(
  location: Location,
  actors: Actor[],
  time: MinutesFromMidnight,
): Visit[] {
  return actors.flatMap((actor) => {
    const activity = activityAt(actor, time);
    return activity?.locationId === location.id ? [{ actor, activity }] : [];
  });
}

const ICON_BUTTON_HEIGHT = 34;

const locationName = (location: Location) => location.name || "Unnamed place";
const actorName = (actor: Actor) => actor.name || "Unnamed actor";

export default function LocationsSidebar({
  locations,
  actors,
  time,
}: {
  locations: Location[];
  actors: Actor[];
  time: MinutesFromMidnight;
}) {
  const [locationShowingDetails, setLocationShowingDetails] =
    useState<Location | null>(null);

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Locations at {formatTime(time)}
      </Typography>
      {locations.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No locations yet.
        </Typography>
      )}
      {locations.map((location) => {
        const { Icon } = locationIconOrDefault(location.icon);
        const presentCount = actorsPresent(location, actors, time).length;
        return (
          <Box
            key={location.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minHeight: ICON_BUTTON_HEIGHT,
            }}
          >
            <Box
              sx={{
                display: "flex",
                color: presentCount > 0 ? "text.primary" : "text.disabled",
              }}
            >
              <Icon size={18} />
            </Box>
            <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
              {locationName(location)}
            </Typography>
            {presentCount > 0 && (
              <>
                <Typography variant="caption" color="text.secondary">
                  {presentCount} here
                </Typography>
                <IconButton
                  size="small"
                  aria-label={`Who's at ${locationName(location)}`}
                  onClick={() => setLocationShowingDetails(location)}
                >
                  <StickyNote2OutlinedIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        );
      })}

      <Dialog
        open={locationShowingDetails !== null}
        onClose={() => setLocationShowingDetails(null)}
        fullWidth
        maxWidth="xs"
      >
        {locationShowingDetails && (
          <LocationDetails
            location={locationShowingDetails}
            actors={actors}
            time={time}
          />
        )}
        <DialogActions>
          <Button onClick={() => setLocationShowingDetails(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function LocationDetails({
  location,
  actors,
  time,
}: {
  location: Location;
  actors: Actor[];
  time: MinutesFromMidnight;
}) {
  const { Icon } = locationIconOrDefault(location.icon);
  const present = actorsPresent(location, actors, time);

  return (
    <>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Icon size={22} />
          <span>{locationName(location)}</span>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          At {formatTime(time)}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Here now
        </Typography>
        {present.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nobody.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {present.map((visit) => (
              <VisitLine key={visit.activity.id} visit={visit} />
            ))}
          </Stack>
        )}
      </DialogContent>
    </>
  );
}

function VisitLine({ visit: { actor, activity } }: { visit: Visit }) {
  return (
    <Box
      sx={{
        pl: 1,
        borderLeft: 3,
        borderColor: actor.color,
      }}
    >
      <Typography variant="body2">
        <b>{actorName(actor)}</b> · {formatTime(activity.start)}–
        {formatTime(activity.end)}
      </Typography>
      {activity.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: "pre-line" }}
        >
          {activity.description}
        </Typography>
      )}
    </Box>
  );
}
