import { useState, type SyntheticEvent } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ActivityEditor from "./ActivityEditor";
import { overlappingActivityIds, sortedActivities } from "../cases/time";
import {
  ACTOR_COLORS,
  NO_LOCATION_ID,
  type Activity,
  type Actor,
  type Location,
} from "../cases/types";

const stopCardFromToggling = (e: SyntheticEvent) => e.stopPropagation();

interface ActorEditorProps {
  actor: Actor;
  locations: Location[];
  onChange: (actor: Actor) => void;
  onDelete: () => void;
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
  const overlaps = overlappingActivityIds(actor);
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
    const start = last ? last.end % 1440 : 9 * 60;
    onChange({
      ...actor,
      activities: [
        ...actor.activities,
        {
          id: crypto.randomUUID(),
          locationId: last?.locationId ?? locations[0]?.id ?? NO_LOCATION_ID,
          description: "",
          start,
          end: start + 30,
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
              onClick={stopCardFromToggling}
              onKeyDown={stopCardFromToggling}
              onFocus={stopCardFromToggling}
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
        {activities.map((activity) => (
          <ActivityEditor
            key={activity.id}
            activity={activity}
            locations={locations}
            overlapping={overlaps.has(activity.id)}
            onChange={(patch) => updateActivity(activity.id, patch)}
            onDelete={() =>
              onChange({
                ...actor,
                activities: actor.activities.filter(
                  (a) => a.id !== activity.id,
                ),
              })
            }
          />
        ))}
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
