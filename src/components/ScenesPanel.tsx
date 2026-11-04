import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EntryBox from "./EntryBox";
import { locationIconOrDefault } from "../cases/locationIcons";
import {
  deriveScenes,
  descriptionForScene,
  sceneKey,
  sceneTimeLabel,
  type Scene,
} from "../cases/scenes";
import type { Case, SceneDescription } from "../cases/types";

export type ScenesSubject =
  | { kind: "actor"; id: string }
  | { kind: "location"; id: string };

interface ScenesPanelProps {
  c: Case;
  subject: ScenesSubject | null;
  onDescriptionChange: (scene: Scene, text: string) => void;
  onMarkReviewed: (descriptionId: string) => void;
  onAttach: (descriptionId: string, scene: Scene) => void;
  onDeleteDescription: (descriptionId: string) => void;
}

export default function ScenesPanel({
  c,
  subject,
  onDescriptionChange,
  onMarkReviewed,
  onAttach,
  onDeleteDescription,
}: ScenesPanelProps) {
  const allScenes = deriveScenes(c);
  const unattached = c.sceneDescriptions.filter((d) => !d.attached);
  const actor =
    subject?.kind === "actor"
      ? c.actors.find((a) => a.id === subject.id)
      : undefined;
  const location =
    subject?.kind === "location"
      ? c.locations.find((l) => l.id === subject.id)
      : undefined;
  const subjectName = actor
    ? actor.name || "Unnamed actor"
    : location
      ? location.name || "Unnamed place"
      : null;
  const scenes = allScenes
    .filter((scene) =>
      actor
        ? scene.actorIds.includes(actor.id)
        : location
          ? scene.locationId === location.id
          : false,
    )
    .sort((a, b) => a.start - b.start);
  const activitiesWithoutLocation = actor
    ? actor.activities.filter(
        (a) => !c.locations.some((l) => l.id === a.locationId),
      ).length
    : 0;

  return (
    <Stack spacing={1.5} sx={{ p: 1.5, overflowY: "auto", minHeight: 0 }}>
      {unattached.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Unattached descriptions
          </Typography>
          {unattached.map((d) => (
            <UnattachedDescription
              key={d.id}
              c={c}
              description={d}
              scenes={allScenes}
              onAttach={(scene) => onAttach(d.id, scene)}
              onDelete={() => onDeleteDescription(d.id)}
            />
          ))}
        </Stack>
      )}

      {subjectName === null ? (
        <Typography color="text.secondary">
          Select an actor or location on the left to see their scenes.
        </Typography>
      ) : (
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Scenes for {subjectName}
        </Typography>
      )}
      {activitiesWithoutLocation > 0 && (
        <Typography variant="body2" color="text.secondary">
          {activitiesWithoutLocation} activit
          {activitiesWithoutLocation === 1 ? "y has" : "ies have"} no location,
          so {activitiesWithoutLocation === 1 ? "it isn't" : "they aren't"} in
          any scene.
        </Typography>
      )}
      {subjectName !== null && scenes.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No scenes yet.
        </Typography>
      )}
      <Box>
        {scenes.map((scene) => (
          <SceneCard
            key={sceneKey(scene)}
            c={c}
            scene={scene}
            onDescriptionChange={(text) => onDescriptionChange(scene, text)}
            onMarkReviewed={onMarkReviewed}
          />
        ))}
      </Box>
    </Stack>
  );
}

function sceneLocationName(c: Case, locationId: string): string {
  const location = c.locations.find((l) => l.id === locationId);
  if (!location) return "Deleted location";
  return location.name || "Unnamed place";
}

function SceneCard({
  c,
  scene,
  onDescriptionChange,
  onMarkReviewed,
}: {
  c: Case;
  scene: Scene;
  onDescriptionChange: (text: string) => void;
  onMarkReviewed: (descriptionId: string) => void;
}) {
  const location = c.locations.find((l) => l.id === scene.locationId);
  const { Icon } = locationIconOrDefault(location?.icon);
  const description = descriptionForScene(c, scene);
  const reviewNotes = description?.reviewNotes ?? [];
  const actorsInScene = c.actors.filter((a) => scene.actorIds.includes(a.id));

  return (
    <Accordion
      disableGutters
      variant="outlined"
      slotProps={{ transition: { unmountOnExit: true } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", flex: 1, minWidth: 0, mr: 1 }}
        >
          <Box sx={{ display: "flex", flexShrink: 0 }}>
            <Icon size={18} />
          </Box>
          <Typography noWrap sx={{ fontWeight: 600, flex: 1, minWidth: 0 }}>
            {sceneLocationName(c, scene.locationId)}
          </Typography>
          {reviewNotes.length > 0 && (
            <Chip size="small" color="warning" label="Review" />
          )}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "nowrap" }}
          >
            {sceneTimeLabel(scene)}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails
        sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0 }}
      >
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
        {description && reviewNotes.length > 0 && (
          <Alert
            severity="warning"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => onMarkReviewed(description.id)}
              >
                Mark reviewed
              </Button>
            }
          >
            {reviewNotes.join(". ")}.
          </Alert>
        )}
        <TextField
          size="small"
          label="Description"
          multiline
          minRows={3}
          value={description?.text ?? ""}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </AccordionDetails>
    </Accordion>
  );
}

function UnattachedDescription({
  c,
  description,
  scenes,
  onAttach,
  onDelete,
}: {
  c: Case;
  description: SceneDescription;
  scenes: Scene[];
  onAttach: (scene: Scene) => void;
  onDelete: () => void;
}) {
  return (
    <EntryBox sx={{ gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
          Was at {sceneLocationName(c, description.locationId)},{" "}
          {sceneTimeLabel(description)}
        </Typography>
        <IconButton
          size="small"
          color="error"
          aria-label="Delete description"
          onClick={onDelete}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {description.reviewNotes.join(". ")}.
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
        {description.text}
      </Typography>
      <TextField
        select
        size="small"
        label="Attach to scene"
        value=""
        onChange={(e) => {
          const scene = scenes.find((s) => sceneKey(s) === e.target.value);
          if (scene) onAttach(scene);
        }}
      >
        {scenes.map((scene) => (
          <MenuItem key={sceneKey(scene)} value={sceneKey(scene)}>
            {sceneLocationName(c, scene.locationId)}, {sceneTimeLabel(scene)}
          </MenuItem>
        ))}
      </TextField>
    </EntryBox>
  );
}
