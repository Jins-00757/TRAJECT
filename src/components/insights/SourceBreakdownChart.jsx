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
import { SOURCE_COLORS } from "../../lib/chartColors";
import { ChartTooltip } from "./ChartTooltip";

export default function SourceBreakdownChart({ data }) {
  const scheme = useComputedColorScheme("light");
  const colors = SOURCE_COLORS[scheme];
  const gridColor = scheme === "dark" ? "#2c2c2a" : "#e1e0d9";
  const tickColor = "#898781";

  return (
    <Paper withBorder p="md" radius="md">
      <Text fw={600} size="sm" mb={4}>
        Where applications come from
      </Text>
      <Text size="xs" c="dimmed" mb="md">
        By source, all-time
      </Text>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 8, left: 0, bottom: 4 }}
          accessibilityLayer
        >
          <CartesianGrid vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="source"
            tick={{ fontSize: 10.5, fill: tickColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={44}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            width={26}
          />
          <Tooltip
            cursor={{ fill: "var(--mantine-color-default-hover)" }}
            content={
              <ChartTooltip
                formatter={(p) => `${p.payload.source}: ${p.value}`}
              />
            }
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
            <LabelList
              dataKey="count"
              position="top"
              style={{
                fill: "var(--mantine-color-text)",
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            {data.map((entry, i) => (
              <Cell key={entry.source} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
