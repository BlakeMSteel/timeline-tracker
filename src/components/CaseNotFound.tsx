import { Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router";

export default function CaseNotFound() {
  return (
    <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
      <Typography>Case not found.</Typography>
      <Button component={Link} to="/">
        Back to cases
      </Button>
    </Stack>
  );
}
