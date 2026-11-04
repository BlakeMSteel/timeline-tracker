import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import MarkdownText from "./MarkdownText";
import { locationIconOrDefault } from "../cases/locationIcons";
import {
  deriveScenes,
  descriptionForScene,
  sceneAt,
  sceneTimeLabel,
} from "../cases/scenes";
import { formatTime } from "../cases/time";
import type { Case, Location, MinutesFromMidnight } from "../cases/types";

const ICON_BUTTON_HEIGHT = 34;

const locationName = (location: Location) => location.name || "Unnamed place";

export default function LocationsSidebar({
  c,
  time,
}: {
  c: Case;
  time: MinutesFromMidnight;
}) {
  const [locationShowingScene, setLocationShowingScene] =
    useState<Location | null>(null);
  const scenes = deriveScenes(c);

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Locations at {formatTime(time)}
      </Typography>
      {c.locations.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No locations yet.
        </Typography>
      )}
      {c.locations.map((location) => {
        const { Icon } = locationIconOrDefault(location.icon);
        const scene = sceneAt(scenes, location.id, time);
        const presentCount = scene?.actorIds.length ?? 0;
        const hasDescription = scene && descriptionForScene(c, scene);
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
              <Typography variant="caption" color="text.secondary">
                {presentCount} here
              </Typography>
            )}
            {(presentCount > 0 || hasDescription) && (
              <IconButton
                size="small"
                aria-label={`Scene at ${locationName(location)}`}
                onClick={() => setLocationShowingScene(location)}
              >
                <StickyNote2OutlinedIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        );
      })}

      <Dialog
        open={locationShowingScene !== null}
        onClose={() => setLocationShowingScene(null)}
        fullWidth
        maxWidth="sm"
      >
        {locationShowingScene && (
          <SceneDetails c={c} location={locationShowingScene} time={time} />
        )}
        <DialogActions>
          <Button onClick={() => setLocationShowingScene(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function SceneDetails({
  c,
  location,
  time,
}: {
  c: Case;
  location: Location;
  time: MinutesFromMidnight;
}) {
  const { Icon } = locationIconOrDefault(location.icon);
  const scene = sceneAt(deriveScenes(c), location.id, time);
  const description = scene && descriptionForScene(c, scene);
  const actorsInScene = scene
    ? c.actors.filter((actor) => scene.actorIds.includes(actor.id))
    : [];

  return (
    <>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Icon size={22} />
          <span>{locationName(location)}</span>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {scene ? sceneTimeLabel(scene) : formatTime(time)}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {actorsInScene.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nobody here.
              </Typography>
            ) : (
              actorsInScene.map((actor) => (
                <Chip
                  key={actor.id}
                  size="small"
                  label={actor.name || "Unnamed actor"}
                  sx={{
                    bgcolor: actor.color,
                    color: "common.white",
                    fontWeight: 600,
                  }}
                />
              ))
            )}
          </Box>
          {description ? (
            <MarkdownText text={description.text} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No description for this scene.
            </Typography>
          )}
        </Stack>
      </DialogContent>
    </>
  );
}
