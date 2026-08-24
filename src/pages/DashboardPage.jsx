import { SimpleGrid, Card, Text, Stack } from "@mantine/core";
import { useApplications } from "../context/ApplicationsContext";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";

export default function DashboardPage() {
  const { applications, loading, error, refetch } = useApplications();

  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (loading) return <Loader label="Loading dashboard…" />;

  const total = applications.length;
  const active = applications.filter((a) => !["offer", "closed"].includes(a.status)).length;
  const interviewing = applications.filter((a) => a.status === "interviewing").length;
  const offers = applications.filter((a) => a.status === "offer").length;

  const stats = [
    { label: "Total applications", value: total },
    { label: "Active pipeline", value: active },
    { label: "Interviewing", value: interviewing },
    { label: "Offers", value: offers },
  ];

  return (
    <Stack gap="md">
      <Text fw={700} size="xl">Dashboard</Text>
      {/* 2 columns under 768px so tiles don't get cramped, 4 from sm up */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        {stats.map((s) => (
          <Card key={s.label} withBorder padding="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{s.label}</Text>
            <Text fz={28} fw={700}>{s.value}</Text>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}