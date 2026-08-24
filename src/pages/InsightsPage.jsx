import { SimpleGrid, Stack, Text } from "@mantine/core";
import {
  IconBriefcase,
  IconTargetArrow,
  IconAlertTriangle,
  IconMoodSmile,
} from "@tabler/icons-react";
import { useApplications } from "../context/ApplicationsContext";
import {
  computeFunnel,
  computeApplicationsOverTime,
  computeSourceBreakdown,
  computeStaleApplications,
  computeStats,
} from "../lib/insights";
import StatTile from "../components/insights/StatTile";
import ConversionFunnelChart from "../components/insights/ConversionFunnelChart";
import ApplicationsOverTimeChart from "../components/insights/ApplicationsOverTimeChart";
import SourceBreakdownChart from "../components/insights/SourceBreakdownChart";
import StaleApplicationsList from "../components/insights/StaleApplicationsList";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";

export default function InsightsPage() {
  const { applications, loading, error, refetch } = useApplications();

  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (loading) return <Loader label="Loading insights…" />;

  const stats = computeStats(applications);
  const funnel = computeFunnel(applications);
  const overTime = computeApplicationsOverTime(applications);
  const sources = computeSourceBreakdown(applications);
  const stale = computeStaleApplications(applications);

  return (
    <Stack gap="md" style={{ minWidth: 0 }}>
      <Text fw={700} size="xl">
        Insights
      </Text>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        <StatTile
          label="Total applications"
          value={stats.total}
          icon={IconBriefcase}
          color="teal"
        />
        <StatTile
          label="Active pipeline"
          value={stats.active}
          sub={`${stats.closed} closed`}
          icon={IconTargetArrow}
          color="blue"
        />
        <StatTile
          label="Offers"
          value={stats.offers}
          icon={IconMoodSmile}
          color="violet"
        />
        <StatTile
          label="Needs follow-up"
          value={stats.stale}
          icon={IconAlertTriangle}
          color="orange"
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <ConversionFunnelChart data={funnel} />
        <StaleApplicationsList applications={stale} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <ApplicationsOverTimeChart data={overTime} />
        <SourceBreakdownChart data={sources} />
      </SimpleGrid>
    </Stack>
  );
}
