import { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Slider,
  Stack,
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
  formatTime,
  sortedActivities,
  wholeHoursCoveringActivities,
} from "../cases/time";
import { caseTitle, type Actor, type Case } from "../cases/types";
import { useCase } from "./useCase";

export function CaseTimelinePage() {
  const { id } = useParams();
  const c = useCase(id);

  if (c === "loading")
    return <Typography color="text.secondary">Loading…</Typography>;
  if (c === "not-found") return <CaseNotFound />;
  return <CaseTimeline key={c.id} c={c} />;
}

const PLAY_STEP = 5;
const PLAY_INTERVAL_MS = 150;

function CaseTimeline({ c }: { c: Case }) {
  const range = wholeHoursCoveringActivities(c.actors);
  const [from, to] = range;
  const [time, setTime] = useState(from);
  const [playing, setPlaying] = useState(false);

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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 300px" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <MapCanvas image={c.map.image} alt={c.map.name || "Map"}>
          <ActorPaths c={c} actors={c.actors} />
          <LocationPins c={c} actors={c.actors} />
          <CurrentActorPositions c={c} actors={c.actors} time={time} />
        </MapCanvas>
        <EntryBox>
          <Whereabouts actors={c.actors} locations={c.locations} time={time} />
        </EntryBox>
      </Box>

      {c.actors.length > 0 && (
        <TimelineChart
          actors={c.actors}
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

function ActorPaths({ c, actors }: { c: Case; actors: Actor[] }) {
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

function LocationPins({ c, actors }: { c: Case; actors: Actor[] }) {
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
                  {formatTime(a.start)}–{formatTime(a.end)}{" "}
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
const ACTOR_MARKER_SIZE = 28;

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words.map((word) => word.charAt(0).toUpperCase()).join("");
}

function CurrentActorPositions({
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
    const pixelOffset: [number, number] =
      together.length > 1
        ? [Math.cos(angle) * SPREAD_RADIUS, Math.sin(angle) * SPREAD_RADIUS]
        : [0, 0];
    return (
      <MapPoint key={actor.id} x={l.x} y={l.y} pixelOffset={pixelOffset}>
        <Tooltip
          title={
            <>
              <b>{actor.name || "Unnamed actor"}</b> at{" "}
              {l.name || "Unnamed place"}
              <br />
              {formatTime(a.start)}–{formatTime(a.end)}
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
              minWidth: ACTOR_MARKER_SIZE,
              height: ACTOR_MARKER_SIZE,
              px: 0.5,
              borderRadius: ACTOR_MARKER_SIZE / 2 + "px",
              bgcolor: actor.color,
              color: "common.white",
              border: 2,
              borderColor: "common.white",
              boxShadow: 3,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: -0.3,
              whiteSpace: "nowrap",
              cursor: "help",
            }}
          >
            {initials(actor.name)}
          </Box>
        </Tooltip>
      </MapPoint>
    );
  });
}
