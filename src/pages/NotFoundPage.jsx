import { Link } from "react-router-dom";
import { Stack, Title, Text, Button, Center } from "@mantine/core";

export default function NotFoundPage() {
  return (
    <Center py={80}>
      <Stack align="center" gap="xs">
        <Title order={1} fz={64} c="dimmed">404</Title>
        <Text c="dimmed">That page doesn't exist.</Text>
        <Button component={Link} to="/" variant="light" mt="sm">Back to dashboard</Button>
      </Stack>
    </Center>
  );
}