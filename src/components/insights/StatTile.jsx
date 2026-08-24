import { Paper, Text, Group, ThemeIcon } from "@mantine/core";

export default function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  color = "teal",
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed" fw={500}>
            {label}
          </Text>
          <Text
            size="xl"
            fw={700}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </Text>
          {sub && (
            <Text size="xs" c="dimmed">
              {sub}
            </Text>
          )}
        </div>
        {Icon && (
          <ThemeIcon
            variant="light"
            color={color}
            size={36}
            radius="md"
            style={{ flexShrink: 0 }}
          >
            <Icon size={20} aria-hidden="true" />
          </ThemeIcon>
        )}
      </Group>
    </Paper>
  );
}
