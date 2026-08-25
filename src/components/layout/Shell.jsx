// src/components/layout/Shell.jsx
import { AppShell, Group, Burger, NavLink as MantineNavLink, useMantineColorScheme, useComputedColorScheme, ActionIcon, Tooltip } from '@mantine/core';
import { NavLink, useLocation } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import {
  IconLayoutDashboard,
  IconLayoutKanban,
  IconList,
  IconBuilding,
  IconChartInfographic,
  IconUser,
  IconSun,
  IconMoon,
} from '@tabler/icons-react';
import Logo from './Logo';

const links = [
  { to: '/', label: 'Dashboard', icon: IconLayoutDashboard },
  { to: '/board', label: 'Board', icon: IconLayoutKanban },
  { to: '/applications', label: 'Applications', icon: IconList },
  { to: '/companies', label: 'Companies', icon: IconBuilding },
  { to: '/insights', label: 'Insights', icon: IconChartInfographic },
  { to: '/profile', label: 'Profile', icon: IconUser },
];

export default function Shell({ children }) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const location = useLocation();

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            {/* Tagline auto-hides below the sm breakpoint inside Logo
                itself — no header height juggling needed here. */}
            <Logo size="md" showTagline />
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
            active={l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to)}
            onClick={close}
            mb={2}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

/**
 * Dark mode toggle — from Day 5. useMantineColorScheme()'s own
 * `colorScheme` can be "auto", which would make the icon lie whenever the
 * OS is dark but the stored preference is still "auto". useComputedColorScheme
 * resolves "auto" to what's actually on screen, which is what should drive
 * both the icon and which direction the click toggles.
 */
function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const next = computed === 'dark' ? 'light' : 'dark';

  return (
    <Tooltip label={`Switch to ${next} mode`}>
      <ActionIcon
        variant="default"
        size="lg"
        radius="md"
        aria-label={`Switch to ${next} mode`}
        onClick={() => setColorScheme(next)}
      >
        {computed === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Tooltip>
  );
}
