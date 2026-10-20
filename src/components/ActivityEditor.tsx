import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNoteIcon from "@mui/icons-material/EditNote";
import {
  formatTime,
  fromTimeInputValue,
  isNextDay,
  nextOccurrenceAfter,
  toTimeInputValue,
} from "../cases/time";
import { NO_LOCATION_ID, type Activity, type Location } from "../cases/types";

interface ActivityEditorProps {
  activity: Activity;
  locations: Location[];
  overlapping: boolean;
  onChange: (patch: Partial<Activity>) => void;
  onDelete: () => void;
}

export default function ActivityEditor({
  activity,
  locations,
  overlapping,
  onChange,
  onDelete,
}: ActivityEditorProps) {
  const [describing, setDescribing] = useState(false);
  const placeName =
    locations.find((l) => l.id === activity.locationId)?.name ||
    "Unnamed place";

  return (
    <Box
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          select
          size="small"
          label="Place"
          value={activity.locationId}
          onChange={(e) => onChange({ locationId: e.target.value })}
          sx={{ flex: 1 }}
        >
          <MenuItem value={NO_LOCATION_ID}>
            <em>None</em>
          </MenuItem>
          {locations.map((l) => (
            <MenuItem key={l.id} value={l.id}>
              {l.name || "Unnamed place"}
            </MenuItem>
          ))}
        </TextField>
        <Tooltip title={activity.description || "Add description"}>
          <IconButton
            size="small"
            aria-label="Edit description"
            color={activity.description ? "primary" : "default"}
            onClick={() => setDescribing(true)}
          >
            <EditNoteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          size="small"
          label="Start"
          type="time"
          value={toTimeInputValue(activity.start)}
          onChange={(e) => {
            const start = fromTimeInputValue(e.target.value);
            if (start !== null)
              onChange({
                start,
                end: nextOccurrenceAfter(start, activity.end),
              });
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: 1 }}
        />
        <TextField
          size="small"
          label={isNextDay(activity.end) ? "End (next day)" : "End"}
          type="time"
          value={toTimeInputValue(activity.end)}
          onChange={(e) => {
            const end = fromTimeInputValue(e.target.value);
            if (end !== null)
              onChange({ end: nextOccurrenceAfter(activity.start, end) });
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: 1 }}
        />
        <IconButton
          size="small"
          color="error"
          aria-label="Delete activity"
          onClick={onDelete}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      {overlapping && (
        <Typography variant="caption" color="error">
          Overlaps another activity
        </Typography>
      )}

      <Dialog
        open={describing}
        onClose={() => setDescribing(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {placeName}, {formatTime(activity.start)}–{formatTime(activity.end)}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            label="Description"
            value={activity.description}
            onChange={(e) => onChange({ description: e.target.value })}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDescribing(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
