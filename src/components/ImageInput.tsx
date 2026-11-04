import { Box, Button, Stack } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useObjectUrl } from "../cases/useObjectUrl";

const IMAGE_PREVIEW_MAX_HEIGHT = 160;

export default function ImageInput({
  value,
  alt,
  onChange,
}: {
  value: Blob | undefined;
  alt: string;
  onChange: (image: Blob | undefined) => void;
}) {
  const imageUrl = useObjectUrl(value ?? null);

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Button
          component="label"
          size="small"
          variant="outlined"
          startIcon={<AddPhotoAlternateIcon />}
        >
          {value ? "Replace image" : "Add image"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(file);
              e.target.value = "";
            }}
          />
        </Button>
        {value && (
          <Button
            size="small"
            color="error"
            onClick={() => onChange(undefined)}
          >
            Remove image
          </Button>
        )}
      </Stack>
      {imageUrl && (
        <Box
          component="img"
          src={imageUrl}
          alt={alt}
          sx={{
            display: "block",
            maxWidth: "100%",
            maxHeight: IMAGE_PREVIEW_MAX_HEIGHT,
            alignSelf: "flex-start",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
          }}
        />
      )}
    </>
  );
}
