// src/pages/CompaniesPage.jsx
import { useEffect, useState } from "react";
import { Stack, SimpleGrid, Card, Text, Group, Badge } from "@mantine/core";
import { Link } from "react-router-dom";
import { getCompanies } from "../api/companies";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";
import Empty from "../components/ui/Empty";
import CompanyLogo from "../components/companies/CompanyLogo";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    setCompanies(null);
    setError(null);
    getCompanies().then(setCompanies).catch((err) => setError(err.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!companies) return <Loader label="Loading companies…" />;
  if (companies.length === 0) return <Empty message="No companies yet." />;

  return (
    <Stack gap="md">
      <Text fw={700} size="xl">Companies</Text>
      {/* 1 column under 576px, 2 from sm, 3 from md — mobile-first grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
        {companies.map((c) => (
          <Card key={c.id} component={Link} to={`/companies/${c.id}`} withBorder>
            <Text fw={600}>{c.name}</Text> <CompanyLogo company={c} size="sm" />
            <Group gap={6} mt={4}>
              <Badge size="sm" variant="light">{c.industry}</Badge>
              <Text size="xs" c="dimmed">{c.hqCity}</Text>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}