import { Box, Link } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownText({ text }: { text: string }) {
  return (
    <Box
      sx={{
        typography: "body2",
        overflowWrap: "anywhere",
        "& > :first-of-type": { mt: 0 },
        "& > :last-child": { mb: 0 },
        "& p": { my: 1 },
        "& h1, & h2, & h3, & h4, & h5, & h6": {
          mt: 2,
          mb: 1,
          lineHeight: 1.3,
          fontWeight: 700,
        },
        "& h1": { fontSize: "1.4rem" },
        "& h2": { fontSize: "1.25rem" },
        "& h3": { fontSize: "1.1rem" },
        "& h4, & h5, & h6": { fontSize: "1rem" },
        "& ul, & ol": { my: 1, pl: 3 },
        "& li": { my: 0.25 },
        "& blockquote": {
          my: 1,
          mx: 0,
          pl: 1.5,
          borderLeft: 3,
          borderColor: "divider",
          color: "text.secondary",
        },
        "& code": {
          px: 0.5,
          borderRadius: 0.5,
          bgcolor: "action.hover",
          fontFamily: "monospace",
          fontSize: "0.9em",
        },
        "& pre": {
          my: 1,
          p: 1,
          borderRadius: 1,
          bgcolor: "action.hover",
          overflowX: "auto",
        },
        "& pre code": { p: 0, bgcolor: "transparent" },
        "& hr": { my: 2, border: 0, borderTop: 1, borderColor: "divider" },
        "& img": { maxWidth: "100%" },
        "& table": { my: 1, borderCollapse: "collapse" },
        "& th, & td": {
          px: 1,
          py: 0.5,
          border: 1,
          borderColor: "divider",
          textAlign: "left",
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <Link href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </Link>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </Box>
  );
}
