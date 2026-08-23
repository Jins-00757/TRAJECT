import { AppShell, Group, Text, Burger, NavLink as MantineNavLink } from "@mantine/core";
import { NavLink, useLocation } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { IconLayoutDashboard, IconLayoutKanban, IconList, IconBuilding } from "@tabler/icons-react";


const links = [
  { to: "/", label: "Dashboard", icon: IconLayoutDashboard },
  { to: "/board", label: "Board", icon: IconLayoutKanban },
  { to: "/applications", label: "Applications", icon: IconList },
  { to: "/companies", label: "Companies", icon: IconBuilding },
];

export default function Shell({ children }) {

  const [opened, { toggle, close }] = useDisclosure(false);
  const location = useLocation()

  return (
    <AppShell 
    header={{ height: 58 }} 
    navbar={{ width: 220, breakpoint: "sm", collapsed: { mobile: !opened } }} 
    padding="md">
      
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700}>Traject</Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        {links.map((l) => (
          <MantineNavLink
            key={l.to}
            component={NavLink}
            to={l.to}
            label={l.label}
            leftSection={<l.icon size={18} />}
            active={l.to === "/" ? location.pathname === "/" : location.pathname.startsWith(l.to)}
            onClick={close}
            mb={2}
          />
        ))}
      </AppShell.Navbar>
      
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}