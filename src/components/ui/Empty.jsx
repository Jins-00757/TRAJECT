// src/components/ui/Empty.jsx
import { Center, Stack, Text } from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";

export default function Empty({ message = "Nothing here yet.", action }) {
  return (
    <Center py="xl">
      <Stack align="center" gap="sm">
        <IconInbox size={32} color="var(--mantine-color-gray-5)" />
        <Text ta="center" c="dimmed">{message}</Text>
        {action}
      </Stack>
    </Center>
  );
}