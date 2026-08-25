// src/components/applications/CompanyCard.jsx
import { useState } from 'react';
import {
  Card,
  Stack,
  Group,
  Text,
  Box,
  Image,
  Skeleton,
  ActionIcon,
  Menu,
  Avatar,
} from '@mantine/core';
import { IconBuilding, IconMapPin, IconUsers, IconLink, IconDots, IconExternalLink, IconGlobe } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

// Builds a Google favicon URL for a given website — used as the fallback
// when a company's primary logo (often Clearbit) fails to load. Google's
// favicon service sits on a core google.com domain, so unlike clearbit.com
// (owned by HubSpot, commonly blocklisted by ad/privacy blockers as a
// tracking domain) it's almost never blocked client-side.
//
// NOTE: this previously returned another logo.clearbit.com URL by mistake
// — a "fallback" that's blocked by the same ad blocker as the primary
// source doesn't actually fall back to anything. Fixed to genuinely hit
// Google's s2/favicons endpoint instead.
function googleFaviconUrl(website, size = 128) {
  if (!website) return null;
  try {
    const domain = new URL(website).hostname.replace(/^www\./, '');
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  } catch {
    return null;
  }
}

/**
 * Rich company card component.
 *
 * Props:
 * - company: object (required) - company data
 *   { id, name, industry, hqCity, size, website, coverImageUrl, logo }
 * - loading: boolean (default: false) - show skeleton
 * - variant: 'default' | 'hover' - card style variant
 * - onBookmark?: function - handle bookmark click
 */
export default function CompanyCard({ company, loading = false, onBookmark = null }) {
  // Skeleton state
  if (loading) {
    return (
      <Card withBorder p="md" radius="md" style={{ overflow: 'hidden' }}>
        <Skeleton height={120} mb="md" radius="md" />
        <Skeleton height={16} width="70%" mb="xs" radius="md" />
        <Skeleton height={12} width="50%" mb="md" radius="md" />
        <Group justify="space-between">
          <Skeleton height={20} width="40%" radius="md" />
          <Skeleton height={20} width="20%" radius="md" />
        </Group>
      </Card>
    );
  }

  if (!company) return null;

  // Determine cover image or use gradient
  const hasCoverImage = company.coverImageUrl && company.coverImageUrl.startsWith('http');
  const gradients = [
    'linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-cyan-6))',
    'linear-gradient(135deg, var(--mantine-color-purple-6), var(--mantine-color-pink-6))',
    'linear-gradient(135deg, var(--mantine-color-green-6), var(--mantine-color-teal-6))',
    'linear-gradient(135deg, var(--mantine-color-orange-6), var(--mantine-color-red-6))',
  ];

  // Deterministic gradient based on company ID
  const gradientIndex = (company.id || 0) % gradients.length;
  const gradient = gradients[gradientIndex];

  return (
    <Card
      component={Link}
      to={`/companies/${company.id}`}
      withBorder
      padding={0}
      radius="md"
      className="company-card-hover"
      style={{
        overflow: 'hidden',
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      }}
    >
      {/* Cover image section */}
      <Box
        style={{
          position: 'relative',
          height: 120,
          background: gradient,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {hasCoverImage && <CoverImage src={company.coverImageUrl} alt={company.name} />}

        {/* Company logo overlay (optional) */}
        {company.logo && <LogoBadge company={company} />}
      </Box>

      {/* Card content */}
      <Stack gap="xs" p="md" style={{ minHeight: 'auto' }}>
        {/* Company name + menu */}
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <div style={{ minWidth: 0 }}>
            <Text fw={600} size="sm" truncate style={{ lineHeight: 1.3 }}>
              {company.name}
            </Text>
            <Group gap={4} mt={4}>
              <IconBuilding size={14} style={{ flexShrink: 0 }} />
              <Text size="xs" c="dimmed" truncate>
                {company.industry || 'Unknown'}
              </Text>
            </Group>
          </div>

          {/* Floating menu (only show on full card, not in link) */}
          {onBookmark && (
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconLink size={14} />}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onBookmark(company.id);
                  }}
                >
                  Bookmark
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconExternalLink size={14} />}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (company.website) {
                      window.open(company.website, '_blank');
                    }
                  }}
                >
                  Visit website
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>

        {/* Metadata badges */}
        <Group gap={6} wrap="wrap">
          {company.hqCity && (
            <Group gap={4} style={{ whiteSpace: 'nowrap' }}>
              <IconMapPin size={12} style={{ flexShrink: 0 }} />
              <Text size="xs" c="dimmed">
                {company.hqCity}
              </Text>
            </Group>
          )}
          {company.size && (
            <Group gap={4} style={{ whiteSpace: 'nowrap' }}>
              <IconUsers size={12} style={{ flexShrink: 0 }} />
              <Text size="xs" c="dimmed">
                {company.size}
              </Text>
            </Group>
          )}
        </Group>

        {/* Website — deliberately NOT an <Anchor>/<a>. The whole card is
            already a react-router <Link> (renders its own outer <a>), and
            nesting a real anchor inside another anchor is invalid HTML —
            browsers silently drop/merge them, which triggers a hydration
            warning and can make the inner link's clicks unreliable. A
            plain clickable Group/Text + window.open() gives the same
            "open website" behavior without nesting anchors. */}
        {company.website && (
          <Group
            gap={4}
            wrap="nowrap"
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer', width: 'fit-content' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(company.website, '_blank', 'noopener,noreferrer');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                window.open(company.website, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <IconGlobe size={12} style={{ flexShrink: 0, color: 'var(--mantine-color-blue-6)' }} />
            <Text size="xs" c="blue" truncate style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>
              {company.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
}

/**
 * Cover image with a self-clearing failure state — if coverImageUrl 404s
 * or is blocked, this quietly steps aside and lets the card's gradient
 * background (already sitting behind it) show through, instead of
 * rendering a broken-image icon or a generic gray placeholder square.
 */
function CoverImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <Image
      src={src}
      alt={alt}
      height={120}
      fit="cover"
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Logo badge with automatic fallback chain:
 * 1. company.logo as provided by the API (often a Clearbit URL)
 * 2. Google's favicon service, derived from company.website
 * 3. A plain initials avatar, if both image sources fail
 *
 * This mirrors the fallback used on CompaniesPage.jsx so logos behave
 * consistently everywhere they're rendered in the app. Ad blockers and
 * privacy extensions frequently blocklist clearbit.com (it's owned by
 * HubSpot and flagged as a tracking/enrichment domain), which is the most
 * common reason a `logo` URL silently fails to load — this makes that
 * failure recoverable instead of showing a blank box.
 */
function LogoBadge({ company }) {
  const [logoSrc, setLogoSrc] = useState(company.logo);
  const [logoFailed, setLogoFailed] = useState(false);

  function handleError() {
    const fallback = googleFaviconUrl(company.website);
    if (fallback && logoSrc !== fallback) {
      setLogoSrc(fallback);
    } else {
      setLogoFailed(true);
    }
  }

  return (
    <Box
      style={{
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
      }}
    >
      {logoSrc && !logoFailed ? (
        <Image src={logoSrc} alt={company.name} width={40} height={40} fit="contain" onError={handleError} />
      ) : (
        <Avatar size={40} radius="sm" color="blue" style={{ fontWeight: 700, fontSize: 14 }}>
          {(company.name || '?').substring(0, 2).toUpperCase()}
        </Avatar>
      )}
    </Box>
  );
}
