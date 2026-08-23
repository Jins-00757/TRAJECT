// src/components/ui/Loader.jsx
import { Center, Loader as MantineLoader, Text, Stack } from "@mantine/core";

export default function Loader({ label = "Loading…" }) {
  return (
    <Center py="xl">
      <Stack align="center" gap="xs">
        <MantineLoader color="teal" />
        <Text size="sm" c="dimmed">{label}</Text>
      </Stack>
    </Center>
  );
}