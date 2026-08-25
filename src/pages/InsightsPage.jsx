import {
  Stack,
  SimpleGrid,
  Text,
  Card,
  Tabs,
  Group,
  Badge,
  Box,
  useComputedColorScheme,
} from "@mantine/core";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  IconBriefcase,
  IconTargetArrow,
  IconMoodSmile,
  IconAlertTriangle,
  IconTrendingUp,
  IconCalendarEvent,
} from "@tabler/icons-react";

import { useApplications } from "../context/ApplicationsContext";
import {
  computeStats,
  computeSalaryRanges,
  computeMonthlyTimeline,
  computeStatusBreakdown,
  STALE_THRESHOLD_DAYS,
} from "../lib/insights";
import { SOURCE_COLORS, TRAJECTORY_LINE } from "../lib/chartColors";
import StatTile from "../components/insights/StatTile";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";



// One SVG text label per pie slice. Defined ONCE at module scope, not as a
// factory called inline in JSX — a factory hands recharts a brand-new
// function identity on every render. Fill uses the CSS token directly, so
// it's mode-correct with no JS color computation needed at all.
function PieSliceLabel({ cx, cy, midAngle, outerRadius, name, value }) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="var(--mantine-color-text)"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${name}: ${value}`}
    </text>
  );
}

export default function InsightsPage() {
  // Same source every other page reads from — one fetch on mount, shared via
  // context, applications already carrying `company` (json-server's _expand).
  const { applications, loading, error, refetch } = useApplications();
  const scheme = useComputedColorScheme("light");
  const gridColor = scheme === "dark" ? "#2c2c2a" : "#e1e0d9";
  const tickColor = "#898781";
  const [minColor, maxColor] = SOURCE_COLORS[scheme];
  const statusColors = SOURCE_COLORS[scheme].slice(0, 3);
  const lineColor = TRAJECTORY_LINE[scheme];

  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (loading) return <Loader label="Loading insights…" />;

  const stats = computeStats(applications);
  const salaryData = computeSalaryRanges(applications);
  const timelineData = computeMonthlyTimeline(applications);
  const statusData = computeStatusBreakdown(applications);

  const statTiles = [
    { label: "Total applications", value: stats.total, icon: IconBriefcase, color: "teal" },
    { label: "Active pipeline", value: stats.active, sub: `${stats.closed} closed`, icon: IconTargetArrow, color: "blue" },
    { label: "Offers received", value: stats.offers, icon: IconMoodSmile, color: "violet" },
    { label: "Needs follow-up", value: stats.stale, icon: IconAlertTriangle, color: "orange" },
  ];

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <Text fw={700} size="xl">Analytics &amp; Insights</Text>
        <Badge leftSection={<IconCalendarEvent size={12} />}>This month</Badge>
      </Group>

      <Text size="sm" c="dimmed">Track your job search progress with real-time analytics</Text>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        {statTiles.map((tile) => (
          <StatTile key={tile.label} {...tile} />
        ))}
      </SimpleGrid>

      <Tabs defaultValue="salary">
        <Tabs.List>
          <Tabs.Tab value="salary" leftSection={<IconTrendingUp size={16} />}>Salary ranges</Tabs.Tab>
          <Tabs.Tab value="timeline">Application timeline</Tabs.Tab>
          <Tabs.Tab value="status">Status breakdown</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="salary">
          <Card withBorder p="md" mt="md">
            {salaryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salaryData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11, fill: tickColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} width={34} />
                  <Tooltip
                    cursor={{ fill: "var(--mantine-color-default-hover)" }}
                    contentStyle={{ background: "var(--mantine-color-body)", border: "1px solid var(--mantine-color-default-border)" }}
                    formatter={(value) => `€${value.toLocaleString()}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: tickColor }} />
                  <Bar dataKey="min" fill={minColor} name="Min salary" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="max" fill={maxColor} name="Max salary" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Text ta="center" c="dimmed" py="xl">No salary data available</Text>
            )}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="timeline">
          <Card withBorder p="md" mt="md">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: tickColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip cursor={{ fill: "var(--mantine-color-default-hover)" }} contentStyle={{ background: "var(--mantine-color-body)", border: "1px solid var(--mantine-color-default-border)" }} />
                  <Line type="monotone" dataKey="applications" stroke={lineColor} strokeWidth={2} dot={{ r: 4, fill: lineColor, strokeWidth: 0 }} activeDot={{ r: 6 }} name="Applications" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Text ta="center" c="dimmed" py="xl">No timeline data available</Text>
            )}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="status">
          <Card withBorder p="md" mt="md">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart accessibilityLayer>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={PieSliceLabel}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={entry.name} fill={statusColors[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--mantine-color-body)", border: "1px solid var(--mantine-color-default-border)" }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Tabs.Panel>
      </Tabs>

      <Card withBorder p="md" style={{ background: "var(--mantine-color-blue-light)" }}>
        <Box>
          <Text fw={600} size="sm">💡 Quick insight</Text>
          <Text size="sm" c="dimmed" mt={4}>
            {stats.stale > 0
              ? `You have ${stats.stale} application${stats.stale === 1 ? "" : "s"} that ${stats.stale === 1 ? "hasn't" : "haven't"} been updated in over ${STALE_THRESHOLD_DAYS}+ days. A follow-up could help revive your pipeline.`
              : "Every active application has had recent activity — nothing needs a follow-up right now."}
          </Text>
        </Box>
      </Card>
    </Stack>
  );
}