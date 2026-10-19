import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Link, useParams } from "react-router";
import CaseNotFound from "../components/CaseNotFound";
import EntryBox from "../components/EntryBox";
import MapCanvas, { MapPoint, PlacePin } from "../components/MapCanvas";
import TimelineChart from "../components/TimelineChart";
import Whereabouts from "../components/Whereabouts";
import {
  activityAt,
  activityEnd,
  formatTime,
  sortedActivities,
  timeRange,
} from "../cases/time";
import { caseTitle, type Actor, type Case } from "../cases/types";
import { useCase } from "./useCase";

/** /case/:id — the case timeline: the map, a time scrubber and everyone's movements. */
export function CaseTimelinePage() {
  const { id } = useParams();
  const c = useCase(id);

  if (c === undefined)
    return <Typography color="text.secondary">Loading…</Typography>;
  if (c === null) return <CaseNotFound />;
  return <CaseTimeline key={c.id} c={c} />;
}

type Layer = "positions" | "paths" | "pins";

const PLAY_STEP = 5;
const PLAY_INTERVAL_MS = 150;

function CaseTimeline({ c }: { c: Case }) {
  const range = timeRange(c.actors);
  const [from, to] = range;
  const [time, setTime] = useState(from);
  const [playing, setPlaying] = useState(false);
  const [layers, setLayers] = useState<Layer[]>(["positions", "paths", "pins"]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const visibleActors = c.actors.filter((a) => !hidden.has(a.id));
  const isPlaying = playing && time < to;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(
      () => setTime((t) => Math.min(t + PLAY_STEP, to)),
      PLAY_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [isPlaying, to]);

  const togglePlay = () => {
    if (isPlaying) {
      setPlaying(false);
    } else {
      if (time >= to) setTime(from);
      setPlaying(true);
    }
  };

  const toggleActor = (actorId: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(actorId)) next.delete(actorId);
      else next.add(actorId);
      return next;
    });

  const marks = [];
  for (let h = from; h <= to; h += 60) marks.push({ value: h });

  return (
    <Stack spacing={2}>
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
          variant="outlined"
          component={Link}
          to={`/case/${c.id}/edit`}
          startIcon={<EditIcon />}
        >
          Edit case
        </Button>
      </Box>

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {caseTitle(c)}
        </Typography>
        {c.map.description && (
          <Typography color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
            {c.map.description}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
        }}
      >
        <ToggleButtonGroup
          size="small"
          value={layers}
          onChange={(_, value: Layer[]) => setLayers(value)}
          aria-label="Map layers"
        >
          <ToggleButton value="positions">Positions</ToggleButton>
          <ToggleButton value="paths">Paths</ToggleButton>
          <ToggleButton value="pins">Places</ToggleButton>
        </ToggleButtonGroup>
        {c.actors.map((actor) => {
          const shown = !hidden.has(actor.id);
          return (
            <Chip
              key={actor.id}
              label={actor.name || "Unnamed actor"}
              onClick={() => toggleActor(actor.id)}
              variant={shown ? "filled" : "outlined"}
              sx={{
                fontWeight: 600,
                bgcolor: shown ? actor.color : undefined,
                color: shown ? "common.white" : "text.secondary",
                borderColor: actor.color,
                "&:hover": {
                  bgcolor: shown ? actor.color : undefined,
                  opacity: 0.85,
                },
              }}
            />
          );
        })}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 300px" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <MapCanvas image={c.map.image} alt={c.map.name || "Map"}>
          {layers.includes("paths") && <Paths c={c} actors={visibleActors} />}
          {layers.includes("pins") && <Pins c={c} actors={visibleActors} />}
          {layers.includes("positions") && (
            <Positions c={c} actors={visibleActors} time={time} />
          )}
        </MapCanvas>
        <EntryBox>
          <Whereabouts
            actors={visibleActors}
            locations={c.locations}
            time={time}
          />
        </EntryBox>
      </Box>

      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <IconButton
          color="primary"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={togglePlay}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <Slider
          min={from}
          max={to}
          step={PLAY_STEP}
          marks={marks}
          value={time}
          onChange={(_, value) => {
            setPlaying(false);
            setTime(value);
          }}
          valueLabelDisplay="auto"
          valueLabelFormat={formatTime}
          aria-label="Time"
        />
        <Typography
          sx={{
            fontWeight: 700,
            minWidth: 48,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatTime(time)}
        </Typography>
      </Stack>

      {visibleActors.length > 0 && (
        <TimelineChart
          actors={visibleActors}
          locations={c.locations}
          range={range}
          time={time}
          onTimeChange={(t) => {
            setPlaying(false);
            setTime(t);
          }}
        />
      )}
    </Stack>
  );
}

/** A line per actor joining their places in the order they visited them. */
function Paths({ c, actors }: { c: Case; actors: Actor[] }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {actors.map((actor) => {
        const points = sortedActivities(actor)
          .map((a) => c.locations.find((l) => l.id === a.locationId))
          .filter((l) => l !== undefined)
          .filter((l, i, all) => i === 0 || all[i - 1].id !== l.id)
          .map((l) => `${l.x},${l.y}`)
          .join(" ");
        return (
          <polyline
            key={actor.id}
            points={points}
            fill="none"
            stroke={actor.color}
            strokeWidth={3}
            strokeOpacity={0.75}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </Box>
  );
}

/** A pin per place, listing everyone's activities there on hover. */
function Pins({ c, actors }: { c: Case; actors: Actor[] }) {
  return c.locations.map((l) => {
    const visits = actors
      .flatMap((actor) =>
        actor.activities
          .filter((a) => a.locationId === l.id)
          .map((a) => ({ actor, a })),
      )
      .sort((x, y) => x.a.start - y.a.start);
    return (
      <MapPoint key={l.id} x={l.x} y={l.y}>
        <Tooltip
          title={
            <>
              <b>{l.name || "Unnamed place"}</b>
              {visits.length === 0 && <div>No visits</div>}
              {visits.map(({ actor, a }) => (
                <div key={a.id}>
                  {formatTime(a.start)}–{formatTime(activityEnd(a))}{" "}
                  <b style={{ color: actor.color, filter: "brightness(1.6)" }}>
                    {actor.name || "Unnamed actor"}
                  </b>
                  {a.description && `: ${a.description}`}
                </div>
              ))}
            </>
          }
        >
          <Box sx={{ cursor: "help" }}>
            <PlacePin name={l.name} icon={l.icon} />
          </Box>
        </Tooltip>
      </MapPoint>
    );
  });
}

const SPREAD_RADIUS = 16;

/** Each accounted-for actor's marker at their current place, spread out when several share one. */
function Positions({
  c,
  actors,
  time,
}: {
  c: Case;
  actors: Actor[];
  time: number;
}) {
  const present = actors.flatMap((actor) => {
    const a = activityAt(actor, time);
    const l = a && c.locations.find((loc) => loc.id === a.locationId);
    return a && l ? [{ actor, a, l }] : [];
  });

  return present.map(({ actor, a, l }) => {
    const together = present.filter((p) => p.l.id === l.id);
    const index = together.findIndex((p) => p.actor.id === actor.id);
    const angle = (index / together.length) * 2 * Math.PI - Math.PI / 2;
    const offset: [number, number] =
      together.length > 1
        ? [Math.cos(angle) * SPREAD_RADIUS, Math.sin(angle) * SPREAD_RADIUS]
        : [0, 0];
    return (
      <MapPoint key={actor.id} x={l.x} y={l.y} offset={offset}>
        <Tooltip
          title={
            <>
              <b>{actor.name || "Unnamed actor"}</b> at{" "}
              {l.name || "Unnamed place"}
              <br />
              {formatTime(a.start)}–{formatTime(activityEnd(a))}
              {a.description && (
                <>
                  <br />
                  {a.description}
                </>
              )}
            </>
          }
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: actor.color,
              color: "common.white",
              border: 2,
              borderColor: "common.white",
              boxShadow: 3,
              fontWeight: 700,
              fontSize: 13,
              cursor: "help",
            }}
          >
            {(actor.name || "?").charAt(0).toUpperCase()}
          </Box>
        </Tooltip>
      </MapPoint>
    );
  });
}
