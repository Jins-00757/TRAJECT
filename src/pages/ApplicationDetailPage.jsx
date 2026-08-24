import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Stack, Group, Text, Title, Card, Timeline, Anchor, Button } from "@mantine/core";
import { IconArrowLeft, IconBuilding } from "@tabler/icons-react";
import { getApplication } from "../api/applications";
import { formatSalary, formatDate } from "../lib/format";
import StatusBadge from "../components/applications/StatusBadge";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    setApplication(null);
    setError(null);
    getApplication(id).then(setApplication).catch((err) => setError(err.message));
  }
  useEffect(load, [id]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!application) return <Loader label="Loading application…" />;

  return (
    <Stack gap="md">
      <Anchor component={Link} to="/applications" size="sm">
        <Group gap={4}><IconArrowLeft size={14} /> Back to applications</Group>
      </Anchor>

      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>{application.role}</Title>
          <Group gap={6} c="dimmed"><IconBuilding size={16} /><Text>{application.company?.name ?? "Unknown company"}</Text></Group>
        </div>
        <StatusBadge status={application.status} />
      </Group>

      <Card withBorder>
        <Stack gap="xs">
          <Group justify="space-between"><Text size="sm" c="dimmed">Salary</Text><Text size="sm">{formatSalary(application.salaryMin, application.salaryMax, application.currency)}</Text></Group>
          <Group justify="space-between"><Text size="sm" c="dimmed">Work mode</Text><Text size="sm" tt="capitalize">{application.workMode}</Text></Group>
          <Group justify="space-between"><Text size="sm" c="dimmed">Applied</Text><Text size="sm">{formatDate(application.appliedDate)}</Text></Group>
          <Group justify="space-between"><Text size="sm" c="dimmed">Source</Text><Text size="sm">{application.source}</Text></Group>
        </Stack>
      </Card>

      <div>
        <Text fw={600} mb="sm">Interview timeline</Text>
        {application.interviews?.length ? (
          <Timeline active={application.interviews.length} bulletSize={20}>
            {application.interviews.map((iv) => (
              <Timeline.Item key={iv.id} title={iv.round}>
                <Text size="sm" c="dimmed">{iv.interviewer} · {iv.format}</Text>
                <Text size="xs" c="dimmed">{formatDate(iv.date)} — {iv.outcome}</Text>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <Text size="sm" c="dimmed">No interviews logged yet.</Text>
        )}
      </div>

      <Button component={Link} to={`/applications/${id}/edit`} variant="light" style={{ alignSelf: "flex-start" }}>Edit</Button>
    </Stack>
  );
}