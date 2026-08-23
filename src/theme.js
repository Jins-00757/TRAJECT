import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "teal",
  defaultRadius: "md",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  headings: { fontWeight: "700" },
  components: {
    Button: { defaultProps: { radius: "md" } },
    Card: { defaultProps: { radius: "md", withBorder: true } },
  },
});