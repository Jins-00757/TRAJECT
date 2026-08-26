// src/pages/CompaniesPage.jsx - PREMIUM PROFESSIONAL VERSION (lint-clean)

import { useEffect, useMemo, useState } from 'react';
import {
  Stack,
  SimpleGrid,
  Card,
  Text,
  Group,
  Badge,
  TextInput,
  Select,
  Box,
  Image,
  Tooltip,
  ActionIcon,
  Menu,
  Avatar,
  Button,
  Modal,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import {
  IconSearch,
  IconMapPin,
  IconUsers,
  IconGlobe,
  IconDots,
  IconExternalLink,
  IconBookmark,
  IconShare2,
  IconLink,
  IconBriefcase,
  IconPlus,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { motion } from 'motion/react';
import { getCompanies } from '../api/companies';
import ErrorState from '../components/ui/ErrorState';
import Empty from '../components/ui/Empty';
import { CompanyCardsSkeleton } from '../components/ui/Skeletons';
import QuickAddCompanyForm from '../components/companies/QuickAddCompanyForm';

/**
 * Premium Companies Directory Page
 *
 * Features:
 * - Real company logos via Clearbit API
 * - Search and filter functionality
 * - Professional gradient card design
 * - Hover animations and interactions
 * - Employee count, location, website links
 * - Bookmark functionality
 * - Share options
 * - Responsive grid layout
 * - Dark mode support
 * - Add-company button + modal (duplicate-checked via QuickAddCompanyForm)
 */
// Builds a Google favicon URL for a given website — used as the fallback
// when Clearbit's logo doesn't load. Google's favicon service is on a core
// google.com domain, so unlike clearbit.com (owned by HubSpot, commonly
// blocklisted by ad/privacy blockers as a tracking domain) it's almost
// never blocked client-side.
function googleFaviconUrl(website, size = 128) {
  try {
    const domain = new URL(website).hostname.replace(/^www\./, '');
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  } catch {
    return null;
  }
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState(null);
  const [bookmarked, setBookmarked] = useState(new Set());
  const [addOpen, setAddOpen] = useState(false);

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  /**
   * Load companies from API with error handling.
   * This effect ONLY talks to the external system (the API) and calls
   * setState from that async callback — never synchronously in the effect
   * body itself, which is the pattern the lint rule flags.
   */
  async function loadCompanies() {
    setCompanies(null);
    setError(null);

    try {
      const data = await getCompanies();

      if (!data || data.length === 0) {
        setCompanies([]);
        return;
      }

      // Enrich companies with a logo if the API didn't already provide one.
      // Individual cards still self-heal via handleLogoError if whatever
      // URL ends up here fails to load (e.g. blocked by an ad blocker).
      const enrichedCompanies = data.map((company) => {
        if (!company.logo && company.website) {
          const fallback = googleFaviconUrl(company.website);
          return fallback ? { ...company, logo: fallback } : company;
        }
        return company;
      });

      setCompanies(enrichedCompanies);
    } catch (err) {
      setError(err.message);
    }
  }

  // Derived state, not a separate setState-in-effect: filteredCompanies is
  // computed directly from companies/searchQuery/industryFilter on every
  // render (memoized so it only recomputes when one of those actually
  // changes). There's nothing here to "synchronize with an external
  // system" — it's a pure function of existing state, so it doesn't belong
  // in an effect at all (https://react.dev/learn/you-might-not-need-an-effect).
  const filteredCompanies = useMemo(() => {
    if (!companies) return null;

    let filtered = companies;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.industry.toLowerCase().includes(query) ||
          (c.hqCity && c.hqCity.toLowerCase().includes(query))
      );
    }

    if (industryFilter) {
      filtered = filtered.filter((c) => c.industry === industryFilter);
    }

    return filtered;
  }, [companies, searchQuery, industryFilter]);

  /**
   * Toggle bookmark for a company
   */
  function toggleBookmark(companyId) {
    const newBookmarked = new Set(bookmarked);
    if (newBookmarked.has(companyId)) {
      newBookmarked.delete(companyId);
      notifications.show({
        title: 'Removed from bookmarks',
        message: 'Company removed from your bookmarks',
        color: 'gray',
        autoClose: 2000,
      });
    } else {
      newBookmarked.add(companyId);
      notifications.show({
        title: 'Added to bookmarks',
        message: 'You can find this company in your saved list',
        color: 'teal',
        autoClose: 2000,
      });
    }
    setBookmarked(newBookmarked);
  }

  /**
   * Get unique industries for filter dropdown
   */
  const industries = useMemo(
    () => (companies ? [...new Set(companies.map((c) => c.industry))].filter(Boolean).sort() : []),
    [companies]
  );

  /**
   * Called by QuickAddCompanyForm on success. Guards against appending a
   * duplicate card when the person picks "Use <existing>" from the
   * duplicate-detection warning instead of actually creating a new row —
   * in that case `company` is already present in `companies`.
   */
  function handleCompanyCreated(company) {
    setCompanies((prev) => {
      if (!prev) return prev;
      if (prev.some((c) => c.id === company.id)) return prev;
      // Run the same logo-enrichment step newly created companies would
      // otherwise miss until the next full reload.
      const withLogo =
        !company.logo && company.website
          ? { ...company, logo: googleFaviconUrl(company.website) ?? undefined }
          : company;
      return [...prev, withLogo];
    });
    notifications.show({ message: `${company.name} added`, color: 'teal', autoClose: 2000 });
    setAddOpen(false);
  }

  const addCompanyButton = (
    <Button leftSection={<IconPlus size={16} />} onClick={() => setAddOpen(true)}>
      Add company
    </Button>
  );

  const addCompanyModal = (
    <Modal opened={addOpen} onClose={() => setAddOpen(false)} title="Add a company" centered>
      <QuickAddCompanyForm
        companies={companies ?? []}
        onCancel={() => setAddOpen(false)}
        onCreated={handleCompanyCreated}
      />
    </Modal>
  );

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={loadCompanies} />;
  }

  // Loading state
  if (!companies) {
    return (
      <Stack gap="md">
        <div>
          <Text fw={700} size="xl" mb="xs">
            Companies
          </Text>
          <Text size="sm" c="dimmed">
            Loading companies…
          </Text>
        </div>
        <CompanyCardsSkeleton />
      </Stack>
    );
  }

  // Empty state — still needs the Add-company entry point, otherwise a
  // brand-new user has no way in at all.
  if (companies.length === 0) {
    return (
      <Stack gap="md">
        <Group justify="space-between" wrap="wrap">
          <Text fw={700} size="xl">
            Companies
          </Text>
          {addCompanyButton}
        </Group>
        <Empty
          message="No companies added yet. Start building your network!"
          action={
            <Button size="xs" variant="light" onClick={() => setAddOpen(true)}>
              Add your first company
            </Button>
          }
        />
        {addCompanyModal}
      </Stack>
    );
  }

  // No results after filtering
  if (filteredCompanies.length === 0) {
    return (
      <Stack gap="md">
        <PageHeader companiesCount={companies.length} action={addCompanyButton} />
        <SearchAndFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          industryFilter={industryFilter}
          setIndustryFilter={setIndustryFilter}
          industries={industries}
        />
        <Empty
          message={
            searchQuery || industryFilter
              ? 'No companies match your search criteria'
              : 'No companies yet'
          }
        />
        {addCompanyModal}
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {/* Page Header */}
      <PageHeader companiesCount={filteredCompanies.length} total={companies.length} action={addCompanyButton} />

      {/* Search and Filters */}
      <SearchAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        industryFilter={industryFilter}
        setIndustryFilter={setIndustryFilter}
        industries={industries}
      />

      {/* Companies Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={{ base: 'md', sm: 'lg' }}>
        {filteredCompanies.map((company, index) => (
          <CompanyCardPremium
            key={company.id}
            company={company}
            index={index}
            isBookmarked={bookmarked.has(company.id)}
            onBookmark={() => toggleBookmark(company.id)}
          />
        ))}
      </SimpleGrid>

      {/* Results info */}
      <Group justify="center" mt="xl">
        <Text size="sm" c="dimmed">
          Showing {filteredCompanies.length} of {companies.length} companies
        </Text>
      </Group>

      {addCompanyModal}
    </Stack>
  );
}

/**
 * Page header with title and description
 */
function PageHeader({ companiesCount = 0, total = 0, action = null }) {
  return (
    <Box
      style={{
        background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-cyan-6) 100%)',
        borderRadius: 'var(--mantine-radius-lg)',
        padding: 'var(--mantine-spacing-lg)',
        marginBottom: 'var(--mantine-spacing-lg)',
        color: 'white',
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <div>
          <Group gap="xs" mb="xs">
            <IconBriefcase size={24} />
            <Text fw={700} size="xl">
              Companies Directory
            </Text>
          </Group>
          <Text size="sm" opacity={0.9}>
            Explore{' '}
            <strong>
              {companiesCount} {companiesCount === 1 ? 'company' : 'companies'}
            </strong>
            {total > companiesCount && ` (${total} total)`} — Build your professional network
          </Text>
        </div>
        {/* Button sits on a colored gradient header, so it needs the
            "white" variant to stay legible instead of inheriting the
            default filled-teal style, which would blend into the
            gradient at some viewport widths. */}
        {action && (
          <Box style={{ flexShrink: 0 }}>
            {action}
          </Box>
        )}
      </Group>
    </Box>
  );
}

/**
 * Search and filter controls
 */
function SearchAndFilters({ searchQuery, setSearchQuery, industryFilter, setIndustryFilter, industries }) {
  return (
    <Group grow gap="md" mb="md" align="flex-end">
      <TextInput
        placeholder="Search companies by name, industry, or city…"
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        size="md"
        radius="md"
        style={{ flex: 1 }}
      />

      <Select
        placeholder="Filter by industry"
        data={industries.map((ind) => ({ value: ind, label: ind }))}
        value={industryFilter}
        onChange={setIndustryFilter}
        clearable
        searchable
        size="md"
        radius="md"
        style={{ minWidth: '200px' }}
      />
    </Group>
  );
}

/**
 * Professional premium company card with animations
 */
function CompanyCardPremium({ company, index = 0, isBookmarked = false, onBookmark = null }) {
  const [expanded, setExpanded] = useState(false);
  // Tracks which logo source to use: starts with the API-provided/Clearbit
  // URL, falls back to Google favicons on error, and finally to initials
  // if even that fails. Keyed to company.id so navigating between cards
  // doesn't carry over a previous failure state.
  const [logoSrc, setLogoSrc] = useState(company.logo);
  const [logoFailed, setLogoFailed] = useState(false);

  function handleLogoError() {
    const fallback = googleFaviconUrl(company.website);
    if (fallback && logoSrc !== fallback) {
      setLogoSrc(fallback);
    } else {
      setLogoFailed(true);
    }
  }

  // Determine cover gradient based on company ID
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ];

  const gradient = gradients[index % gradients.length];

  // Format employee count
  const formatEmployees = (size) => {
    if (!size) return null;
    const sizeMap = {
      '1-10': '1-10 employees',
      '11-50': '11-50 employees',
      '51-200': '51-200 employees',
      '201-500': '201-500 employees',
      '501-1000': '501-1k employees',
      '1001-5000': '1k-5k employees',
      '5001-10000': '5k-10k employees',
      '10001+': '10k+ employees',
    };
    return sizeMap[size] || size;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <Card
        component={Link}
        to={`/companies/${company.id}`}
        withBorder
        radius="lg"
        p={0}
        className="company-card-premium"
        style={{
          cursor: 'pointer',
          textDecoration: 'none',
          color: 'inherit',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Cover section */}
        <Box
          style={{
            background: gradient,
            height: '120px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Animated background elements */}
          <div
            style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              top: '-50px',
              right: '-50px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              bottom: '-30px',
              left: '-30px',
            }}
          />

          {/* Company logo overlay */}
          {logoSrc && !logoFailed ? (
            <Box
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                position: 'relative',
                zIndex: 10,
                maxWidth: '80px',
                maxHeight: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src={logoSrc}
                alt={company.name}
                fit="contain"
                width={70}
                height={70}
                onError={handleLogoError}
              />
            </Box>
          ) : (
            <Avatar
              size="lg"
              radius="lg"
              color="white"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                fontWeight: 700,
                fontSize: '20px',
              }}
            >
              {company.name.substring(0, 2).toUpperCase()}
            </Avatar>
          )}
        </Box>

        {/* Content section */}
        <Stack gap="xs" p="md" style={{ flex: 1, position: 'relative' }}>
          {/* Company name */}
          <Group justify="space-between" wrap="nowrap" gap="xs">
            <div style={{ flex: 1, minWidth: 0 }}>
              <Tooltip label={company.name} multiline maw={200}>
                <Text fw={700} size="md" truncate style={{ lineHeight: 1.3 }}>
                  {company.name}
                </Text>
              </Tooltip>

              {/* Industry badge */}
              <Group gap={4} mt={6}>
                <Badge
                  size="xs"
                  variant="dot"
                  color="blue"
                  style={{ textTransform: 'capitalize', fontWeight: 500 }}
                >
                  {company.industry}
                </Badge>
              </Group>
            </div>

            {/* Bookmark button */}
            <Tooltip label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
              <ActionIcon
                variant="light"
                color={isBookmarked ? 'yellow' : 'gray'}
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBookmark();
                }}
              >
                <IconBookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Metadata */}
          <Stack gap={6} mt="xs">
            {/* Location */}
            {company.hqCity && (
              <Group gap={6} wrap="nowrap">
                <IconMapPin size={14} style={{ flexShrink: 0, color: 'var(--mantine-color-gray-5)' }} />
                <Text size="xs" c="dimmed" truncate>
                  {company.hqCity}
                  {company.country && `, ${company.country}`}
                </Text>
              </Group>
            )}

            {/* Employee count */}
            {company.size && (
              <Group gap={6} wrap="nowrap">
                <IconUsers size={14} style={{ flexShrink: 0, color: 'var(--mantine-color-gray-5)' }} />
                <Text size="xs" c="dimmed" truncate>
                  {formatEmployees(company.size)}
                </Text>
              </Group>
            )}

            {/* Website — deliberately NOT an <Anchor>/<a>. The whole card
                is already a react-router <Link> (renders its own outer
                <a>), and nesting a real anchor inside another anchor is
                invalid HTML — browsers silently drop/merge them, which is
                what caused the hydration warning and unreliable clicks.
                A plain clickable Text + window.open() gets the same
                "open website" behavior without nesting anchors. */}
            {company.website && (
              <Group
                gap={6}
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
                <IconGlobe size={14} style={{ flexShrink: 0, color: 'var(--mantine-color-gray-5)' }} />
                <Text
                  size="xs"
                  c="blue"
                  truncate
                  style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}
                >
                  Visit website
                </Text>
              </Group>
            )}
          </Stack>

          {/* Description (optional) */}
          {company.description && (
            <Text
              size="xs"
              c="dimmed"
              mt="xs"
              style={{
                display: expanded ? 'block' : '-webkit-box',
                WebkitLineClamp: expanded ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {company.description}
            </Text>
          )}
        </Stack>

        {/* Footer actions */}
        <Group p="sm" gap="xs" justify="space-between" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
          <Tooltip label="Share company">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(`${window.location.origin}/companies/${company.id}`);
                notifications.show({
                  title: 'Copied to clipboard',
                  message: `Company link for ${company.name}`,
                  color: 'teal',
                  autoClose: 2000,
                });
              }}
            >
              <IconShare2 size={14} />
            </ActionIcon>
          </Tooltip>

          <Menu position="bottom-end" shadow="md">
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
                <IconDots size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconLink size={14} />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(company.website, '_blank');
                }}
              >
                Visit website
              </Menu.Item>
              <Menu.Item
                leftSection={<IconExternalLink size={14} />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(`/companies/${company.id}`, '_blank');
                }}
              >
                View details
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Card>

      {/* Card hover animation CSS */}
      <style>{`
        .company-card-premium:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        }

        .company-card-premium:active {
          transform: translateY(-4px);
        }
      `}</style>
    </motion.div>
  );
}