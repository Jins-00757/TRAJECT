import { AppShell, Group, Text } from "@mantine/core";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" }, { to: "/board", label: "Board" },
  { to: "/applications", label: "Applications" }, { to: "/companies", label: "Companies" },
];

export default function Shell({ children }) {
  return (
    <AppShell header={{ height: 58 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Text fw={700}>Traject</Text>
          <Group gap="lg">
            {links.map((l) => <NavLink key={l.to} to={l.to} end={l.to === "/"}>{l.label}</NavLink>)}
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}