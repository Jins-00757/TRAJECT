// src/components/ui/Skeletons.jsx
import { Stack, Group, Skeleton, Card, SimpleGrid, Box } from '@mantine/core';

/**
 * Skeleton for a single application card (mobile view).
 * Matches exact dimensions of ApplicationsPage card.
 */
export function ApplicationCardSkeleton() {
  return (
    <Card withBorder p="md" radius="md">
      <Group justify="space-between" wrap="nowrap" mb="sm">
        <div style={{ flex: 1, minWidth: 0 }}>
          <Skeleton height={20} width="70%" mb="xs" radius="md" />
          <Skeleton height={14} width="45%" radius="md" />
        </div>
        <Skeleton height={24} width={60} radius="md" />
      </Group>
      <Group justify="space-between" mt="sm">
        <Skeleton height={12} width="35%" radius="md" />
        <Skeleton height={12} width="25%" radius="md" />
      </Group>
    </Card>
  );
}

/**
 * Skeleton for application cards list (5 cards).
 * Use this to fill the list view while loading.
 */
export function ApplicationCardsSkeletons() {
  return (
    <Stack gap="xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <ApplicationCardSkeleton key={i} />
      ))}
    </Stack>
  );
}

/**
 * Skeleton for application list table (desktop view).
 * Matches table header + 5 rows.
 */
export function ApplicationTableSkeleton() {
  return (
    <Box>
      {/* Header skeleton */}
      <Group
        p="md"
        style={{
          borderBottom: '1px solid var(--mantine-color-gray-2)',
          background: 'var(--mantine-color-gray-0)',
        }}
      >
        <Skeleton height={14} width="20%" style={{ flex: 1 }} />
        <Skeleton height={14} width="18%" style={{ flex: 0.8 }} />
        <Skeleton height={14} width="15%" style={{ flex: 0.6 }} />
        <Skeleton height={14} width="18%" style={{ flex: 0.7 }} />
        <Skeleton height={14} width="16%" style={{ flex: 0.65 }} />
      </Group>

      {/* Row skeletons */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Group
          key={i}
          p="md"
          style={{
            borderBottom: '1px solid var(--mantine-color-gray-1)',
          }}
        >
          <Skeleton height={16} width="20%" style={{ flex: 1 }} />
          <Skeleton height={16} width="18%" style={{ flex: 0.8 }} />
          <Skeleton height={16} width="15%" style={{ flex: 0.6 }} />
          <Skeleton height={16} width="18%" style={{ flex: 0.7 }} />
          <Skeleton height={16} width="16%" style={{ flex: 0.65 }} />
        </Group>
      ))}
    </Box>
  );
}

/**
 * Skeleton for application detail page.
 * Matches DetailPage layout: back link, title, card, timeline.
 */
export function ApplicationDetailSkeleton() {
  return (
    <Stack gap="md">
      {/* Back link */}
      <Skeleton height={16} width="120px" radius="md" />

      {/* Title area */}
      <div>
        <Skeleton height={24} width="50%" mb="xs" radius="md" />
        <Skeleton height={14} width="30%" radius="md" />
      </div>

      {/* Info card */}
      <Card withBorder p="md">
        <Stack gap="md">
          {Array.from({ length: 4 }).map((_, i) => (
            <Group key={i} justify="space-between">
              <Skeleton height={14} width="25%" radius="md" />
              <Skeleton height={14} width="30%" radius="md" />
            </Group>
          ))}
        </Stack>
      </Card>

      {/* Timeline section */}
      <div>
        <Skeleton height={18} width="25%" mb="md" radius="md" />
        <Stack gap="sm">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} withBorder p="md">
              <Stack gap="xs">
                <Skeleton height={16} width="50%" radius="md" />
                <Skeleton height={12} width="70%" radius="md" />
                <Skeleton height={12} width="40%" radius="md" />
              </Stack>
            </Card>
          ))}
        </Stack>
      </div>
    </Stack>
  );
}

/**
 * Skeleton for a single Kanban board column.
 */
export function BoardColumnSkeleton() {
  return (
    <Box w={272} style={{ flexShrink: 0 }}>
      <Group justify="space-between" mb="md">
        <Skeleton height={18} width="40%" radius="md" />
        <Skeleton height={16} width="20%" radius="md" />
      </Group>

      <Stack gap="xs">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} withBorder p="sm">
            <Skeleton height={16} width="85%" mb="xs" radius="md" />
            <Skeleton height={12} width="60%" mb="xs" radius="md" />
            <Group justify="space-between">
              <Skeleton height={11} width="40%" radius="md" />
              <Skeleton height={11} width="30%" radius="md" />
            </Group>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

/**
 * Skeleton for stat tiles (Insights page).
 */
export function StatTileSkeleton() {
  return (
    <Card withBorder p="md">
      <Skeleton height={12} width="50%" mb="sm" radius="md" />
      <Skeleton height={28} width="45%" mb="xs" radius="md" />
      <Skeleton height={11} width="35%" radius="md" />
    </Card>
  );
}

/**
 * Skeleton for stat tiles grid (4 tiles).
 */
export function StatTilesGridSkeleton() {
  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatTileSkeleton key={i} />
      ))}
    </SimpleGrid>
  );
}

/**
 * Skeleton for chart container.
 */
export function ChartSkeleton() {
  return (
    <Card withBorder p="md">
      <Skeleton height={18} width="35%" mb="md" radius="md" />
      <Skeleton height={200} radius="md" />
    </Card>
  );
}

/**
 * Skeleton for company card grid.
 */
export function CompanyCardsSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} withBorder p="md" radius="md">
          <Skeleton height={120} mb="md" radius="md" />
          <Skeleton height={16} width="70%" mb="xs" radius="md" />
          <Group gap={6}>
            <Skeleton height={20} width="50%" radius="md" />
            <Skeleton height={20} width="35%" radius="md" />
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}

/**
 * Skeleton for company detail page.
 */
export function CompanyDetailSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton height={24} width="50%" radius="md" />
      <Group gap={8}>
        <Skeleton height={20} width="30%" radius="md" />
        <Skeleton height={20} width="25%" radius="md" />
      </Group>

      <Card withBorder p="md">
        <Skeleton height={18} width="30%" mb="md" radius="md" />
        <Stack gap="sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={16} width="80%" radius="md" />
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}