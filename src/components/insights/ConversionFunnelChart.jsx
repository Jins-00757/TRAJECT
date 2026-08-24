import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useComputedColorScheme, Paper, Text } from "@mantine/core";
import { FUNNEL_COLORS } from "../../lib/chartColors";
import { ChartTooltip } from "./ChartTooltip";

export default function ConversionFunnelChart({ data }) {
  const scheme = useComputedColorScheme("light");
  const colors = FUNNEL_COLORS[scheme];
  const gridColor = scheme === "dark" ? "#2c2c2a" : "#e1e0d9";
  const tickColor = "#898781";

  return (
    <Paper withBorder p="md" radius="md">
      <Text fw={600} size="sm" mb={4}>
        Pipeline funnel
      </Text>
      <Text size="xs" c="dimmed" mb="md">
        Active applications that have reached each stage
      </Text>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 28, left: 4, bottom: 4 }}
          accessibilityLayer
        >
          <CartesianGrid horizontal={false} stroke={gridColor} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 12, fill: tickColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={90}
            tick={{ fontSize: 12, fill: tickColor }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--mantine-color-default-hover)" }}
            content={
              <ChartTooltip
                formatter={(p) => `${p.payload.label}: ${p.value} applications`}
              />
            }
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
            <LabelList
              dataKey="count"
              position="right"
              style={{
                fill: "var(--mantine-color-text)",
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            {data.map((entry, i) => (
              <Cell key={entry.stage} fill={colors[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
