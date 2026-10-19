import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
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
  /** Start expanded, e.g. for a newly added actor. */
  defaultExpanded?: boolean;
}

export default function ActorEditor({
  actor,
  locations,
  onChange,
  onDelete,
  defaultExpanded = false,
}: ActorEditorProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
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
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      disableGutters
      variant="outlined"
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{
        borderLeft: 4,
        borderLeftColor: actor.color,
        borderRadius: 1,
        "&::before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", flex: 1, minWidth: 0, mr: 1 }}
        >
          {expanded ? (
            <TextField
              variant="standard"
              placeholder="Name"
              value={actor.name}
              autoFocus={!actor.name}
              onChange={(e) => onChange({ ...actor, name: e.target.value })}
              // Keep clicks and keys in the field from toggling the card.
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              slotProps={{ htmlInput: { "aria-label": "Name" } }}
              sx={{ flex: 1, "& input": { fontWeight: 600 } }}
            />
          ) : (
            <>
              <Typography noWrap sx={{ fontWeight: 600, flex: 1 }}>
                {actor.name || "Unnamed actor"}
              </Typography>
              {overlaps.size > 0 && (
                <WarningAmberIcon
                  color="error"
                  fontSize="small"
                  titleAccess="Has overlapping activities"
                />
              )}
              <Typography variant="body2" color="text.secondary" noWrap>
                {activities.length} activit
                {activities.length === 1 ? "y" : "ies"}
              </Typography>
            </>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails
        sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0 }}
      >
        <Stack direction="row" sx={{ alignItems: "center" }}>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", flex: 1, flexWrap: "wrap" }}
          >
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
          <IconButton
            color="error"
            aria-label="Delete actor"
            onClick={onDelete}
          >
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
                  gridTemplateColumns: "1fr 1fr auto",
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
                  sx={{ gridColumn: "1 / -1" }}
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
                {formatTime(activity.start)} –{" "}
                {formatTime(activityEnd(activity))} (
                {formatDuration(activity.duration)})
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
      </AccordionDetails>
    </Accordion>
  );
}
