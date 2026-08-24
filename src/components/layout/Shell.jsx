import { AppShell, Group, Text, Burger, NavLink as MantineNavLink, ActionIcon, Tooltip } from "@mantine/core";
import { NavLink, useLocation } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconLayoutKanban,
  IconList,
  IconBuilding,
  IconChartInfographic,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";


const links = [
  { to: "/", label: "Dashboard", icon: IconLayoutDashboard },
  { to: "/board", label: "Board", icon: IconLayoutKanban },
  { to: "/insights", label: "Insights", icon: IconChartInfographic},
  { to: "/applications", label: "Applications", icon: IconList },
  { to: "/companies", label: "Companies", icon: IconBuilding },
];

function ColorSchemeToggle() {
  // useMantineColorScheme's own `colorScheme` can be "auto" — reading that
  // directly would make the icon lie whenever the OS is in dark mode but
  // the value on record is still "auto". useComputedColorScheme resolves
  // "auto" to what's actually on screen, which is the one that should
  // drive the icon and the toggle direction.
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light", { getInitialValueInEffect: true });
  const next = computed === "dark" ? "light" : "dark";

  return (
    <Tooltip label={`Switch to ${next} mode`}>
      <ActionIcon
        variant="default"
        size="lg"
        radius="md"
        aria-label={`Switch to ${next} mode`}
        onClick={() => setColorScheme(next)}
      >
        {computed === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Tooltip>
  );
}

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
          <ColorSchemeToggle />
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