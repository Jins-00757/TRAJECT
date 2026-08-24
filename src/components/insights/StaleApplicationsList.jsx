import { Paper, Text, Stack, Group, Badge, Anchor } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconAlertTriangle } from "@tabler/icons-react";
import { STATUS_MAP } from "../../lib/statusConfig";

const CRITICAL_STALE_DAYS = 21;

export default function StaleApplicationsList({ applications }) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group gap={6} mb={4}>
        <IconAlertTriangle
          size={16}
          color="var(--mantine-color-orange-6)"
          aria-hidden="true"
        />
        <Text fw={600} size="sm">
          Needs a follow-up
        </Text>
      </Group>
      <Text size="xs" c="dimmed" mb="sm">
        No recorded activity in 10+ days, in Applied or Interviewing
      </Text>
      {applications.length === 0 ? (
        <Text size="xs" c="dimmed">
          Nothing stale — every active application has had recent activity.
        </Text>
      ) : (
        <Stack gap="xs">
          {applications.map((a) => (
            <Group key={a.id} justify="space-between" wrap="nowrap" gap="sm">
              <div style={{ minWidth: 0 }}>
                <Anchor
                  component={Link}
                  to={`/applications/${a.id}`}
                  size="sm"
                  fw={500}
                  truncate="end"
                >
                  {a.role}
                </Anchor>
                <Text size="xs" c="dimmed" truncate="end">
                  {a.company?.name ?? "—"} · {STATUS_MAP[a.status]?.label}
                </Text>
              </div>
              <Badge
                color={a.staleDays >= CRITICAL_STALE_DAYS ? "red" : "orange"}
                variant="light"
                style={{ flexShrink: 0 }}
              >
                {a.staleDays}d quiet
              </Badge>
            </Group>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
