import { useEffect, useState } from "react";
import { TextInput, Select, Table, Card, Stack, Group, Text, Box, Anchor } from "@mantine/core";
import { IconSearch, IconPlus } from "@tabler/icons-react";
import { Button } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { getApplications } from "../api/applications";
import { STATUS_OPTIONS } from "../lib/statusConfig";
import { formatSalary, formatDate } from "../lib/format";
import StatusBadge from "../components/applications/StatusBadge";
//import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";
import Empty from "../components/ui/Empty";
import { ApplicationCardsSkeletons } from "../components/ui/Skeletons";


// Search is server-side (json-server's `q` full-text param), not a client-side
// .filter() over an already-fetched array — debounced so typing doesn't fire
// a request on every keystroke.
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(null);
  const [sort, setSort] = useState("appliedDate:desc");
  const debouncedSearch = useDebouncedValue(search, 300);

  const [applications, setApplications] = useState(null);
  const [error, setError] = useState(null);

  const queryKey = `${debouncedSearch}|${status ?? ""}|${sort}`;
const [lastQueryKey, setLastQueryKey] = useState(queryKey);
if (queryKey !== lastQueryKey) {
  setLastQueryKey(queryKey);
  setApplications(null);
  setError(null);
}

const [retryToken, setRetryToken] = useState(0);

useEffect(() => {
  const [sortField, sortOrder] = sort.split(":");
  const params = { _sort: sortField, _order: sortOrder };
  if (debouncedSearch) params.q = debouncedSearch;
  if (status) params.status = status;

  let cancelled = false;
  getApplications(params)
    .then((data) => {
      if (!cancelled) {
        setApplications(data);
        setError(null);
      }
    })
    .catch((err) => {
      if (!cancelled) setError(err.message);
    });

  return () => { cancelled = true; };
}, [debouncedSearch, status, sort, retryToken]);

function retry() {
  setError(null);
  setApplications(null);
  setRetryToken((t) => t + 1); // guarantees the Effect above actually re-runs
}

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap">
  <Text fw={700} size="xl">Applications</Text>
  <Button component={Link} to="/applications/new" leftSection={<IconPlus size={16} />}>
    New application
  </Button>
</Group>

      <Group wrap="wrap" gap="sm">
        <TextInput
          placeholder="Search role, company, notes…"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: "1 1 220px" }}
        />
        <Select placeholder="All stages" data={STATUS_OPTIONS} value={status} onChange={setStatus} clearable style={{ flex: "0 1 180px" }} />
        <Select
          data={[
            { value: "appliedDate:desc", label: "Newest applied" },
            { value: "appliedDate:asc", label: "Oldest applied" },
            { value: "lastActivityDate:desc", label: "Recently active" },
            { value: "priority:desc", label: "Highest priority" },
          ]}
          value={sort}
          onChange={setSort}
          style={{ flex: "0 1 200px" }}
        />
      </Group>

      {error && <ErrorState message={error} onRetry={retry} />}
     {!error && !applications && <ApplicationCardsSkeletons />}

      {!error && applications && applications.length === 0 && <Empty message="No applications match those filters." />}

      {!error && applications && applications.length > 0 && (
        <>
          {/* Mobile-first: cards below the sm breakpoint */}
          <Stack gap="xs" hiddenFrom="sm">
            {applications.map((a) => (
              <Card key={a.id} component={Link} to={`/applications/${a.id}`} withBorder>
                <Group justify="space-between" wrap="nowrap">
                  <Box>
                    <Text fw={600}>{a.role}</Text>
                    <Text size="sm" c="dimmed">{a.company?.name ?? "—"}</Text>
                  </Box>
                  <StatusBadge status={a.status} />
                </Group>
                <Group justify="space-between" mt="xs">
                  <Text size="sm">{formatSalary(a.salaryMin, a.salaryMax, a.currency)}</Text>
                  <Text size="xs" c="dimmed">{formatDate(a.appliedDate)}</Text>
                </Group>
              </Card>
            ))}
          </Stack>

          {/* Table from sm up */}
          <Table.ScrollContainer minWidth={640} visibleFrom="sm">
            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Role</Table.Th><Table.Th>Company</Table.Th><Table.Th>Stage</Table.Th>
                  <Table.Th>Salary</Table.Th><Table.Th>Applied</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {applications.map((a) => (
                  <Table.Tr key={a.id} onClick={() => navigate(`/applications/${a.id}`)} style={{ cursor: "pointer" }}>
                    <Table.Td>
                      <Anchor component={Link} to={`/applications/${a.id}`} underline="never" c="inherit" fw={500}>
                        {a.role}
                      </Anchor>
                    </Table.Td>
                    <Table.Td>{a.company?.name ?? "—"}</Table.Td>
                    <Table.Td><StatusBadge status={a.status} /></Table.Td>
                    <Table.Td>{formatSalary(a.salaryMin, a.salaryMax, a.currency)}</Table.Td>
                    <Table.Td>{formatDate(a.appliedDate)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </>
      )}
    </Stack>
  );
}