import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useComputedColorScheme, Paper, Text } from "@mantine/core";
import { TRAJECTORY_LINE } from "../../lib/chartColors";
import { formatDate } from "../../lib/format";
import { ChartTooltip } from "./ChartTooltip";

export default function ApplicationsOverTimeChart({ data }) {
  const scheme = useComputedColorScheme("light");
  const lineColor = TRAJECTORY_LINE[scheme];
  const gridColor = scheme === "dark" ? "#2c2c2a" : "#e1e0d9";
  const tickColor = "#898781";
  const barColor = scheme === "dark" ? "#383835" : "#e1e0d9"; // recessive — context, not identity

  if (data.length === 0) {
    return (
      <Paper withBorder p="md" radius="md">
        <Text fw={600} size="sm" mb={4}>
          Applications over time
        </Text>
        <Text size="xs" c="dimmed">
          No applications with a recorded applied date yet.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Text fw={600} size="sm" mb={4}>
        Applications over time
      </Text>
      <Text size="xs" c="dimmed" mb="md">
        Weekly submissions (bars) and running total (line)
      </Text>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
          accessibilityLayer
        >
          <CartesianGrid vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="week"
            tickFormatter={(iso) => formatDate(iso).replace(/,? \d{4}$/, "")}
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            width={34}
          />
          <Tooltip
            cursor={{ fill: "var(--mantine-color-default-hover)" }}
            content={
              <ChartTooltip
                labelFormatter={(iso) => formatDate(iso)}
                formatter={(p) =>
                  p.dataKey === "cumulative"
                    ? `Total to date: ${p.value}`
                    : `That week: ${p.value}`
                }
              />
            }
          />
          <Bar
            dataKey="applied"
            fill={barColor}
            radius={[3, 3, 0, 0]}
            maxBarSize={18}
            name="Applied that week"
          />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            name="Total to date"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
}
