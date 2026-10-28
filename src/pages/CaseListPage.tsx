import { useEffect, useState } from "react";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Link, useNavigate } from "react-router";
import EntryBox from "../components/EntryBox";
import {
  InvalidCaseFileError,
  downloadCaseFile,
  readCaseFile,
} from "../cases/caseFile";
import { deleteCase, listCases, saveCase } from "../cases/db";
import { caseTitle, newCase, type Case } from "../cases/types";

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

  const handleImport = async (file: File) => {
    try {
      const imported = await readCaseFile(file);
      await saveCase(imported);
      setCases(await listCases());
    } catch (error) {
      alert(
        error instanceof InvalidCaseFileError
          ? error.message
          : `Couldn't import ${file.name}.`,
      );
    }
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
        <Stack direction="row" spacing={1}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
          >
            Import
            <input
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
                e.target.value = "";
              }}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNew}
          >
            New Case
          </Button>
        </Stack>
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
                  aria-label="Export case"
                  title="Export as JSON"
                  onClick={() => downloadCaseFile(c)}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
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
