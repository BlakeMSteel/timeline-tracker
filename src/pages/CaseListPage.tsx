import { useEffect, useState } from "react";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link, useNavigate } from "react-router";
import EntryBox from "../components/EntryBox";
import { deleteCase, listCases, saveCase } from "../cases/db";
import { caseTitle, newCase, type Case } from "../cases/types";

/** / — lists saved cases with create, open, edit and delete. */
export function CaseListPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[] | null>(null);

  useEffect(() => {
    listCases().then(setCases);
  }, []);

  const handleNew = async () => {
    const c = newCase();
    await saveCase(c);
    navigate(`/case/${c.id}/edit`);
  };

  const handleDelete = async (c: Case) => {
    if (!confirm(`Delete "${caseTitle(c)}"?`)) return;
    await deleteCase(c.id);
    setCases(await listCases());
  };

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Cases
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleNew}>
          New Case
        </Button>
      </Box>

      {cases === null ? (
        <Typography color="text.secondary">Loading…</Typography>
      ) : cases.length === 0 ? (
        <Typography color="text.secondary">
          No cases yet. Create one, add a map image, and start placing your
          actors.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {cases.map((c) => (
            <EntryBox
              key={c.id}
              sx={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{caseTitle(c)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {c.actors.length} actor{c.actors.length === 1 ? "" : "s"} ·{" "}
                  {c.locations.length} place
                  {c.locations.length === 1 ? "" : "s"}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Button
                  size="small"
                  variant="contained"
                  component={Link}
                  to={`/case/${c.id}`}
                >
                  Open
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  component={Link}
                  to={`/case/${c.id}/edit`}
                >
                  Edit
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Delete case"
                  onClick={() => handleDelete(c)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </EntryBox>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
