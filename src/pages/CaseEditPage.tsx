import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
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
import LocationIconPicker from "../components/LocationIconPicker";
import { TOOLBAR_HEIGHT } from "../components/Header";
import MapCanvas, { MapPoint, PlacePin } from "../components/MapCanvas";
import { saveCase } from "../cases/db";
import { DEFAULT_LOCATION_ICON } from "../cases/locationIcons";
import {
  ACTOR_COLORS,
  NO_LOCATION_ID,
  type Actor,
  type Case,
  type FractionOfImageSize,
  type Location,
} from "../cases/types";
import { useCase } from "./useCase";

export function CaseEditPage() {
  const { id } = useParams();
  const c = useCase(id);

  if (c === "loading")
    return <Typography color="text.secondary">Loading…</Typography>;
  if (c === "not-found") return <CaseNotFound />;
  return <CaseForm key={c.id} initialCase={c} />;
}

const NEW_LOCATION = "new-location";
type LocationBeingPlaced = typeof NEW_LOCATION | Location["id"] | null;

type SidebarTab = "locations" | "actors";

const APP_CONTAINER_VERTICAL_PADDING = 24;

function CaseForm({ initialCase }: { initialCase: Case }) {
  const [c, setC] = useState(initialCase);
  const [locationBeingPlaced, setLocationBeingPlaced] =
    useState<LocationBeingPlaced>(null);
  const [tab, setTab] = useState<SidebarTab>("locations");
  const [justAddedActorId, setJustAddedActorId] = useState<string | null>(null);
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up("md"));

  useEffect(() => {
    if (c !== initialCase) saveCase(c);
  }, [c, initialCase]);

  const update = (patch: Partial<Case>) =>
    setC((prev) => ({ ...prev, ...patch }));

  const handlePick = (x: FractionOfImageSize, y: FractionOfImageSize) => {
    if (locationBeingPlaced === NEW_LOCATION) {
      update({
        locations: [
          ...c.locations,
          {
            id: crypto.randomUUID(),
            name: `Place ${c.locations.length + 1}`,
            x,
            y,
            icon: DEFAULT_LOCATION_ICON,
          },
        ],
      });
    } else if (locationBeingPlaced) {
      update({
        locations: c.locations.map((l) =>
          l.id === locationBeingPlaced ? { ...l, x, y } : l,
        ),
      });
    }
    setLocationBeingPlaced(null);
  };

  const deletePlace = (placeId: string) => {
    const uses = c.actors
      .flatMap((a) => a.activities)
      .filter((a) => a.locationId === placeId).length;
    if (
      uses > 0 &&
      !confirm(
        `${uses} activit${uses === 1 ? "y is" : "ies are"} at this location. Delete it anyway?`,
      )
    )
      return;
    update({
      locations: c.locations.filter((l) => l.id !== placeId),
      actors: c.actors.map((a) => ({
        ...a,
        activities: a.activities.map((act) =>
          act.locationId === placeId
            ? { ...act, locationId: NO_LOCATION_ID }
            : act,
        ),
      })),
    });
  };

  const addActor = () => {
    const id = crypto.randomUUID();
    setJustAddedActorId(id);
    update({
      actors: [
        ...c.actors,
        {
          id,
          name: "",
          description: "",
          color: ACTOR_COLORS[c.actors.length % ACTOR_COLORS.length],
          activities: [],
        },
      ],
    });
  };

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

  const windowHeightBelowHeader = `calc(100dvh - ${TOOLBAR_HEIGHT + APP_CONTAINER_VERTICAL_PADDING * 2}px)`;

  return (
    <Stack spacing={3} sx={{ height: { md: windowHeightBelowHeader } }}>
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
          View timeline
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "400px 1fr" },
          gridTemplateRows: { md: "minmax(0, 1fr)" },
          gap: 3,
          alignItems: { xs: "start", md: "stretch" },
          flex: { md: 1 },
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            order: { xs: 2, md: 1 },
            display: "flex",
            flexDirection: "column",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.paper",
            minHeight: 0,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value: SidebarTab) => setTab(value)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
          >
            <Tab
              value="locations"
              label={`Locations (${c.locations.length})`}
            />
            <Tab value="actors" label={`Actors (${c.actors.length})`} />
          </Tabs>
          <Stack spacing={1.5} sx={{ p: 1.5, overflowY: "auto" }}>
            {tab === "locations" ? (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  disabled={!c.map.image}
                  onClick={() => setLocationBeingPlaced(NEW_LOCATION)}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Add location
                </Button>
                {c.locations.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {c.map.image
                      ? "Add a location, then click the map where it is."
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
                      borderColor:
                        locationBeingPlaced === l.id
                          ? "primary.main"
                          : "divider",
                    }}
                  >
                    <LocationIconPicker
                      value={l.icon}
                      onChange={(icon) =>
                        update({
                          locations: c.locations.map((loc) =>
                            loc.id === l.id ? { ...loc, icon } : loc,
                          ),
                        })
                      }
                    />
                    <TextField
                      size="small"
                      label="Name"
                      value={l.name}
                      onChange={(e) =>
                        update({
                          locations: c.locations.map((loc) =>
                            loc.id === l.id
                              ? { ...loc, name: e.target.value }
                              : loc,
                          ),
                        })
                      }
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      size="small"
                      aria-label="Move location"
                      title="Move on map"
                      color={
                        locationBeingPlaced === l.id ? "primary" : "default"
                      }
                      onClick={() =>
                        setLocationBeingPlaced(
                          locationBeingPlaced === l.id ? null : l.id,
                        )
                      }
                    >
                      <OpenWithIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="Delete location"
                      onClick={() => deletePlace(l.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </EntryBox>
                ))}
              </>
            ) : (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addActor}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Add actor
                </Button>
                {c.actors.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No actors yet.
                  </Typography>
                )}
                {c.actors.map((actor) => (
                  <ActorEditor
                    key={actor.id}
                    actor={actor}
                    locations={c.locations}
                    onChange={updateActor}
                    onDelete={() => deleteActor(actor)}
                    defaultExpanded={actor.id === justAddedActorId}
                  />
                ))}
              </>
            )}
          </Stack>
        </Box>

        <Stack
          spacing={2}
          sx={{ order: { xs: 1, md: 2 }, minWidth: 0, minHeight: 0 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Map
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 2fr" },
              gap: 2,
            }}
          >
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
              maxRows={4}
              value={c.map.description}
              onChange={(e) =>
                update({ map: { ...c.map, description: e.target.value } })
              }
            />
          </Box>
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
          {locationBeingPlaced && (
            <Alert
              severity="info"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setLocationBeingPlaced(null)}
                >
                  Cancel
                </Button>
              }
            >
              Click the map to{" "}
              {locationBeingPlaced === NEW_LOCATION
                ? "place the new location"
                : "move this location"}
              .
            </Alert>
          )}
          <MapCanvas
            fitToParentHeight={isDesktop}
            image={c.map.image}
            alt={c.map.name || "Map"}
            onPickPoint={locationBeingPlaced ? handlePick : undefined}
          >
            {c.locations.map((l) => (
              <MapPoint key={l.id} x={l.x} y={l.y}>
                <PlacePin
                  name={l.name}
                  icon={l.icon}
                  selected={locationBeingPlaced === l.id}
                />
              </MapPoint>
            ))}
          </MapCanvas>
        </Stack>
      </Box>
    </Stack>
  );
}
