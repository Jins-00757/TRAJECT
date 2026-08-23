// src/components/ui/ErrorState.jsx
import { Center, Stack, Text, Button } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

export default function ErrorState({ message = "Something went wrong loading this page.", onRetry }) {
  return (
    <Center py="xl">
      <Stack align="center" gap="sm" maw={360}>
        <IconAlertTriangle size={32} color="var(--mantine-color-red-6)" />
        <Text ta="center" fw={600}>Couldn't load this</Text>
        <Text ta="center" size="sm" c="dimmed">{message}</Text>
        {onRetry && <Button variant="light" color="teal" onClick={onRetry} size="xs">Try again</Button>}
      </Stack>
    </Center>
  );
}