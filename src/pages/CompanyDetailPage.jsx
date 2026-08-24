// src/pages/CompanyDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Stack, Title, Text, Group, Anchor, Card, Badge } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { getCompany } from "../api/companies";
import { formatSalary } from "../lib/format";
import StatusBadge from "../components/applications/StatusBadge";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";
import Empty from "../components/ui/Empty";

export default function CompanyDetailPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    setCompany(null);
    setError(null);
    getCompany(id).then(setCompany).catch((err) => setError(err.message));
  }
  useEffect(load, [id]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!company) return <Loader label="Loading company…" />;

  return (
    <Stack gap="md">
      <Anchor component={Link} to="/companies" size="sm">
        <Group gap={4}><IconArrowLeft size={14} /> Back to companies</Group>
      </Anchor>
      <Title order={2}>{company.name}</Title>
      <Group gap={6}>
        <Badge variant="light">{company.industry}</Badge>
        <Text size="sm" c="dimmed">{company.hqCity} · {company.size} employees</Text>
      </Group>
      <div>
        <Text fw={600} mb="sm">Your applications here</Text>
        {company.applications?.length ? (
          <Stack gap="xs">
            {company.applications.map((a) => (
              <Card key={a.id} component={Link} to={`/applications/${a.id}`} withBorder>
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>{a.role}</Text>
                    <Text size="xs" c="dimmed">{formatSalary(a.salaryMin, a.salaryMax, a.currency)}</Text>
                  </div>
                  <StatusBadge status={a.status} />
                </Group>
              </Card>
            ))}
          </Stack>
        ) : (
          <Empty message="No applications logged for this company yet." />
        )}
      </div>
    </Stack>
  );
}