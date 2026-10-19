import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link, useParams } from "react-router";
import ActorEditor from "../components/ActorEditor";
import CaseNotFound from "../components/CaseNotFound";
import EntryBox from "../components/EntryBox";
import MapCanvas, { MapPoint, PlacePin } from "../components/MapCanvas";
import { saveCase } from "../cases/db";
import { ACTOR_COLORS, type Actor, type Case } from "../cases/types";
import { useCase } from "./useCase";

/** /case/:id/edit — edits a stored case. */
export function CaseEditPage() {
  const { id } = useParams();
  const c = useCase(id);

  if (c === undefined)
    return <Typography color="text.secondary">Loading…</Typography>;
  if (c === null) return <CaseNotFound />;
  return <CaseForm key={c.id} initialCase={c} />;
}

/** "new" while placing a new place; a place id while moving that place. */
type Picking = "new" | string | null;

function CaseForm({ initialCase }: { initialCase: Case }) {
  const [c, setC] = useState(initialCase);
  const [picking, setPicking] = useState<Picking>(null);

  // Every change is saved straight away; IndexedDB runs the writes in order.
  useEffect(() => {
    if (c !== initialCase) saveCase(c);
  }, [c, initialCase]);

  const update = (patch: Partial<Case>) =>
    setC((prev) => ({ ...prev, ...patch }));

  const handlePick = (x: number, y: number) => {
    if (picking === "new") {
      update({
        locations: [
          ...c.locations,
          {
            id: crypto.randomUUID(),
            name: `Place ${c.locations.length + 1}`,
            x,
            y,
          },
        ],
      });
    } else if (picking) {
      update({
        locations: c.locations.map((l) =>
          l.id === picking ? { ...l, x, y } : l,
        ),
      });
    }
    setPicking(null);
  };

  const deletePlace = (placeId: string) => {
    const uses = c.actors
      .flatMap((a) => a.activities)
      .filter((a) => a.locationId === placeId).length;
    if (
      uses > 0 &&
      !confirm(
        `${uses} activit${uses === 1 ? "y is" : "ies are"} at this place. Delete it anyway?`,
      )
    )
      return;
    update({
      locations: c.locations.filter((l) => l.id !== placeId),
      actors: c.actors.map((a) => ({
        ...a,
        activities: a.activities.map((act) =>
          act.locationId === placeId ? { ...act, locationId: "" } : act,
        ),
      })),
    });
  };

  const addActor = () =>
    update({
      actors: [
        ...c.actors,
        {
          id: crypto.randomUUID(),
          name: "",
          description: "",
          color: ACTOR_COLORS[c.actors.length % ACTOR_COLORS.length],
          activities: [],
        },
      ],
    });

  const updateActor = (actor: Actor) =>
    update({ actors: c.actors.map((a) => (a.id === actor.id ? actor : a)) });

  const deleteActor = (actor: Actor) => {
    if (
      !confirm(
        `Delete "${actor.name || "Unnamed actor"}" and their activities?`,
      )
    )
      return;
    update({ actors: c.actors.filter((a) => a.id !== actor.id) });
  };

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Button component={Link} to="/" startIcon={<ArrowBackIcon />}>
          Cases
        </Button>
        <Button
          variant="contained"
          component={Link}
          to={`/case/${c.id}`}
          startIcon={<VisibilityIcon />}
        >
          View board
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Map
          </Typography>
          <TextField
            size="small"
            label="Name"
            value={c.map.name}
            onChange={(e) =>
              update({ map: { ...c.map, name: e.target.value } })
            }
          />
          <TextField
            size="small"
            label="Description"
            multiline
            minRows={2}
            value={c.map.description}
            onChange={(e) =>
              update({ map: { ...c.map, description: e.target.value } })
            }
          />
          <Button
            component="label"
            size="small"
            variant="outlined"
            startIcon={<AddPhotoAlternateIcon />}
            sx={{ alignSelf: "flex-start" }}
          >
            {c.map.image ? "Replace image" : "Add image"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) update({ map: { ...c.map, image: file } });
                e.target.value = "";
              }}
            />
          </Button>
          {picking && (
            <Alert
              severity="info"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setPicking(null)}
                >
                  Cancel
                </Button>
              }
            >
              Click the map to{" "}
              {picking === "new" ? "place the new location" : "move this place"}
              .
            </Alert>
          )}
          <MapCanvas
            image={c.map.image}
            alt={c.map.name || "Map"}
            onPick={picking ? handlePick : undefined}
          >
            {c.locations.map((l) => (
              <MapPoint key={l.id} x={l.x} y={l.y}>
                <PlacePin name={l.name} selected={picking === l.id} />
              </MapPoint>
            ))}
          </MapCanvas>
        </Stack>

        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Places
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              disabled={!c.map.image}
              onClick={() => setPicking("new")}
            >
              Add place
            </Button>
          </Box>
          {c.locations.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              {c.map.image
                ? "Add a place, then click the map where it is."
                : "Add a map image to start placing locations."}
            </Typography>
          )}
          {c.locations.map((l) => (
            <EntryBox
              key={l.id}
              sx={{
                flexDirection: "row",
                alignItems: "center",
                gap: 1,
                borderColor: picking === l.id ? "primary.main" : "divider",
              }}
            >
              <TextField
                size="small"
                label="Name"
                value={l.name}
                onChange={(e) =>
                  update({
                    locations: c.locations.map((loc) =>
                      loc.id === l.id ? { ...loc, name: e.target.value } : loc,
                    ),
                  })
                }
                sx={{ flex: 1 }}
              />
              <IconButton
                size="small"
                aria-label="Move place"
                title="Move on map"
                color={picking === l.id ? "primary" : "default"}
                onClick={() => setPicking(picking === l.id ? null : l.id)}
              >
                <OpenWithIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                aria-label="Delete place"
                onClick={() => deletePlace(l.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </EntryBox>
          ))}
        </Stack>
      </Box>

      <Stack spacing={2}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Actors
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addActor}>
            Add actor
          </Button>
        </Box>
        {c.actors.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No actors yet.
          </Typography>
        )}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          {c.actors.map((actor) => (
            <ActorEditor
              key={actor.id}
              actor={actor}
              locations={c.locations}
              onChange={updateActor}
              onDelete={() => deleteActor(actor)}
            />
          ))}
        </Box>
      </Stack>
    </Stack>
  );
}
