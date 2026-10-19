import { useState } from "react";
import { Box, IconButton, Popover, Tooltip } from "@mui/material";
import { LOCATION_ICONS, locationIcon } from "../cases/locationIcons";

/** A button showing a location's icon that opens a grid of icons to choose from. */
export default function LocationIconPicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (icon: string) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const current = locationIcon(value);

  return (
    <>
      <Tooltip title={`Icon: ${current.label}`}>
        <IconButton
          size="small"
          aria-label="Choose icon"
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ border: 1, borderColor: "divider" }}
        >
          <current.Icon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 0.5,
            p: 1,
          }}
        >
          {LOCATION_ICONS.map(({ key, label, Icon }) => (
            <Tooltip key={key} title={label}>
              <IconButton
                size="small"
                aria-label={label}
                color={key === current.key ? "primary" : "default"}
                onClick={() => {
                  onChange(key);
                  setAnchor(null);
                }}
                sx={{
                  border: 1,
                  borderColor:
                    key === current.key ? "primary.main" : "transparent",
                }}
              >
                <Icon fontSize="small" />
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Popover>
    </>
  );
}
