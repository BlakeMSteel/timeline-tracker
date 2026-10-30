import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import EntryBox from "./EntryBox";
import LocationIconPicker from "./LocationIconPicker";
import type { Location } from "../cases/types";

interface LocationEditorProps {
  location: Location;
  isBeingMoved: boolean;
  onChange: (patch: Partial<Location>) => void;
  onToggleMove: () => void;
  onDelete: () => void;
}

export default function LocationEditor({
  location,
  isBeingMoved,
  onChange,
  onToggleMove,
  onDelete,
}: LocationEditorProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [editingDetails, setEditingDetails] = useState(false);

  const closeMenuThen = (action: () => void) => () => {
    setMenuAnchor(null);
    action();
  };

  return (
    <EntryBox
      sx={{
        flexDirection: "row",
        alignItems: "center",
        gap: 1,
        borderColor: isBeingMoved ? "primary.main" : "divider",
      }}
    >
      <LocationIconPicker
        value={location.icon}
        onChange={(icon) => onChange({ icon })}
      />
      <TextField
        size="small"
        label="Name"
        value={location.name}
        onChange={(e) => onChange({ name: e.target.value })}
        sx={{ flex: 1 }}
      />
      <IconButton
        size="small"
        aria-label="Location actions"
        color={isBeingMoved ? "primary" : "default"}
        onClick={(e) => setMenuAnchor(e.currentTarget)}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={menuAnchor}
        open={menuAnchor !== null}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={closeMenuThen(() => setEditingDetails(true))}>
          <ListItemIcon>
            <StickyNote2OutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={closeMenuThen(onToggleMove)}>
          <ListItemIcon>
            <OpenWithIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{isBeingMoved ? "Cancel move" : "Move"}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={closeMenuThen(onDelete)}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={editingDetails}
        onClose={() => setEditingDetails(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{location.name || "Unnamed place"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            label="Details"
            value={location.details ?? ""}
            onChange={(e) => onChange({ details: e.target.value })}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingDetails(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </EntryBox>
  );
}
