import { Paper, Text, Stack } from "@mantine/core";

export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  formatter,
}) {
  if (!active || !payload?.length) return null;
  return (
    <Paper
      withBorder
      shadow="sm"
      p="xs"
      radius="sm"
      style={{ pointerEvents: "none" }}
    >
      {label != null && (
        <Text size="xs" fw={600} mb={4}>
          {labelFormatter ? labelFormatter(label) : label}
        </Text>
      )}
      <Stack gap={2}>
        {payload.map((p) => (
          <Text key={p.dataKey} size="xs">
            {formatter ? formatter(p) : `${p.name}: ${p.value}`}
          </Text>
        ))}
      </Stack>
    </Paper>
  );
}
