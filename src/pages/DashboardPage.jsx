import { useEffect, useState } from "react";
import { Table, Loader, Text } from "@mantine/core";
import { api } from "../api/client";

export default function DashboardPage() {
  const [applications, setApplications] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/applications")
      .then((res) => setApplications(res.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <Text c="red">Failed to load: {error}</Text>;
  if (!applications) return <Loader />;

  return (
    <>
      <Text fw={700} size="xl" mb="md">
        {applications.length} applications loaded from the API
      </Text>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Role</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {applications.map((a) => (
            <Table.Tr key={a.id}>
              <Table.Td>{a.role}</Table.Td>
              <Table.Td>{a.status}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
}
