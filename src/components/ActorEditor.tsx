import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EntryBox from "./EntryBox";
import {
  activityEnd,
  formatDuration,
  formatTime,
  fromTimeInput,
  overlappingIds,
  sortedActivities,
  toTimeInput,
} from "../cases/time";
import {
  ACTOR_COLORS,
  type Activity,
  type Actor,
  type Location,
} from "../cases/types";

interface ActorEditorProps {
  actor: Actor;
  locations: Location[];
  onChange: (actor: Actor) => void;
  onDelete: () => void;
}

export default function ActorEditor({
  actor,
  locations,
  onChange,
  onDelete,
}: ActorEditorProps) {
  const overlaps = overlappingIds(actor);
  const activities = sortedActivities(actor);

  const updateActivity = (id: string, patch: Partial<Activity>) =>
    onChange({
      ...actor,
      activities: actor.activities.map((a) =>
        a.id === id ? { ...a, ...patch } : a,
      ),
    });

  const addActivity = () => {
    const last = activities.at(-1);
    onChange({
      ...actor,
      activities: [
        ...actor.activities,
        {
          id: crypto.randomUUID(),
          locationId: last?.locationId ?? locations[0]?.id ?? "",
          description: "",
          start: last ? activityEnd(last) : 9 * 60,
          duration: 30,
        },
      ],
    });
  };

  return (
    <EntryBox sx={{ borderLeft: 4, borderLeftColor: actor.color }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
        <TextField
          size="small"
          label="Name"
          value={actor.name}
          onChange={(e) => onChange({ ...actor, name: e.target.value })}
          sx={{ flex: 1 }}
        />
        <IconButton color="error" aria-label="Delete actor" onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </Stack>
      <TextField
        size="small"
        label="Description"
        multiline
        minRows={2}
        value={actor.description}
        onChange={(e) => onChange({ ...actor, description: e.target.value })}
      />
      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
          Color
        </Typography>
        {ACTOR_COLORS.map((color) => (
          <Box
            key={color}
            component="button"
            type="button"
            aria-label={`Color ${color}`}
            onClick={() => onChange({ ...actor, color })}
            sx={{
              width: 22,
              height: 22,
              p: 0,
              borderRadius: "50%",
              bgcolor: color,
              cursor: "pointer",
              border: 2,
              borderColor: "common.white",
              outline: actor.color === color ? 2 : 0,
              outlineColor: color,
            }}
          />
        ))}
      </Stack>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
        Activities
      </Typography>
      {activities.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No activities yet.
        </Typography>
      )}
      {activities.map((activity) => {
        const overlapping = overlaps.has(activity.id);
        return (
          <Box
            key={activity.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              p: 1,
              border: 1,
              borderColor: overlapping ? "error.main" : "divider",
              borderRadius: 1,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr 1fr auto",
                  sm: "2fr 1fr 1fr auto",
                },
                gap: 1,
                alignItems: "center",
              }}
            >
              <TextField
                select
                size="small"
                label="Place"
                value={activity.locationId}
                onChange={(e) =>
                  updateActivity(activity.id, { locationId: e.target.value })
                }
                sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {locations.map((l) => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.name || "Unnamed place"}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label="Start"
                type="time"
                value={toTimeInput(activity.start)}
                onChange={(e) => {
                  const start = fromTimeInput(e.target.value);
                  if (start !== null) updateActivity(activity.id, { start });
                }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                size="small"
                label="Minutes"
                type="number"
                value={activity.duration}
                onChange={(e) =>
                  updateActivity(activity.id, {
                    duration: Math.max(
                      1,
                      Math.round(Number(e.target.value)) || 1,
                    ),
                  })
                }
                slotProps={{ htmlInput: { min: 1, step: 5 } }}
              />
              <IconButton
                size="small"
                color="error"
                aria-label="Delete activity"
                onClick={() =>
                  onChange({
                    ...actor,
                    activities: actor.activities.filter(
                      (a) => a.id !== activity.id,
                    ),
                  })
                }
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              size="small"
              label="Description"
              value={activity.description}
              onChange={(e) =>
                updateActivity(activity.id, { description: e.target.value })
              }
            />
            <Typography
              variant="caption"
              color={overlapping ? "error" : "text.secondary"}
            >
              {formatTime(activity.start)} – {formatTime(activityEnd(activity))}{" "}
              ({formatDuration(activity.duration)})
              {overlapping && " · Overlaps another activity"}
            </Typography>
          </Box>
        );
      })}
      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={addActivity}
        sx={{ alignSelf: "flex-start" }}
      >
        Add activity
      </Button>
    </EntryBox>
  );
}
