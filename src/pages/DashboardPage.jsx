import { useEffect, useState } from "react";
import { Avatar, Group, Table, Loader, Text } from "@mantine/core";
import { api } from "../api/client";

function getCompanyLogo(company) {
  if (company?.logo || company?.logoUrl) return company.logo || company.logoUrl;

  try {
    const hostname = new URL(company.website).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const [applications, setApplications] = useState(null);
  const [companies, setCompanies] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/applications"), api.get("/companies")])
      .then(([applicationsResponse, companiesResponse]) => {
        setApplications(applicationsResponse.data);
        setCompanies(companiesResponse.data);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <Text c="red">Failed to load: {error}</Text>;
  if (!applications || !companies) return <Loader />;

  return (
    <>
      <Text fw={700} size="xl" mb="md">
        {applications.length} applications loaded from the API
      </Text>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Company</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {applications.map((a) => (
            <Table.Tr key={a.id}>
              <Table.Td>
                {(() => {
                  const company = companies.find((item) => item.id === a.companyId);
                  const companyName = company?.name || "Unknown company";
                  const logo = getCompanyLogo(company);

                  return (
                    <Group gap="sm" wrap="nowrap">
                      <Avatar
                        src={logo}
                        alt={`${companyName} logo`}
                        radius="sm"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      >
                        {companyName.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Text>{companyName}</Text>
                    </Group>
                  );
                })()}
              </Table.Td>
              <Table.Td>{a.role}</Table.Td>
              <Table.Td>{a.status}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
}
