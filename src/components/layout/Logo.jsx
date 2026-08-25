// src/components/layout/Logo.jsx
import { Group, Stack, Text, Box } from '@mantine/core';
import { motion } from 'motion/react';

/**
 * Traject's brand mark — an icon (a stylised route/checkpoint path,
 * representing an application's journey through the pipeline), a
 * gradient wordmark, and an optional tagline underneath.
 *
 * Usage:
 *   <Logo />                          // icon + "Traject", no tagline
 *   <Logo showTagline />              // icon + "Traject" + punchline
 *   <Logo size="lg" showTagline />    // bigger, for a splash/empty state
 *   <Logo iconOnly />                 // just the mark, for tight spaces
 *   <Logo showTagline tagline="Your trajectory, tracked." />  // custom line
 */
export default function Logo({
  size = 'md',
  showTagline = false,
  iconOnly = false,
  tagline = 'JOB HUNTING,ORGANIZED',
}) {
  const dims = SIZES[size] ?? SIZES.md;

  return (
    <Group gap={dims.gap} wrap="nowrap" align="center">
      <LogoMark size={dims.icon} />
      {!iconOnly && (
        <Stack gap={0} justify="center">
          <Text
            fw={800}
            variant="gradient"
            gradient={{ from: 'teal.5', to: 'grape.6', deg: 115 }}
            style={{
              fontSize: dims.word,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            TRAJECT
          </Text>
          {showTagline && (
            <Text
              size={dims.tagline}
              c="dimmed"
              fs="BOLD"
              fw={500}
              visibleFrom="sm"
              style={{ lineHeight: 1.2, letterSpacing: '0.01em' }}
            >
              {tagline}
            </Text>
          )}
        </Stack>
      )}
    </Group>
  );
}

const SIZES = {
  sm: { icon: 26, word: 16, tagline: 9, gap: 8 },
  md: { icon: 34, word: 21, tagline: 11, gap: 10 },
  lg: { icon: 52, word: 32, tagline: 14, gap: 14 },
  xl: { icon: 72, word: 44, tagline: 16, gap: 18 },
};

/**
 * The icon mark: a rounded square with a three-stop teal → blue → grape
 * gradient (warmer/more colorful than a flat two-tone), containing a
 * simple checkpoint/path glyph — a dotted line from a hollow "start" node
 * to a filled "offer" node. On hover it gives a small spring-based wiggle
 * (scale + rotate), a playful nod to "movement/progress" that fits an
 * app about tracking momentum, without being a constant idle animation
 * that would fight the "spend boldness in one place" instinct.
 */
function LogoMark({ size = 34 }) {
  return (
    <motion.div
      whileHover={{ scale: 1.08, rotate: -6 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 14 }}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background:
          'linear-gradient(135deg, var(--mantine-color-teal-5) 0%, var(--mantine-color-blue-6) 50%, var(--mantine-color-grape-6) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 3px 12px rgba(80, 60, 160, 0.28)',
        cursor: 'pointer',
      }}
    >
      <Box
        component="svg"
        w={size * 0.62}
        h={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        {/* dotted path from start to finish */}
        <path
          d="M3 18 C 7 18, 7 10, 11 10 S 17 4, 21 4"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="0.5 4"
          opacity="0.9"
        />
        {/* start node (hollow) */}
        <circle cx="3" cy="18" r="2.25" fill="none" stroke="white" strokeWidth="2" />
        {/* end node (filled — the "offer") */}
        <circle cx="21" cy="4" r="2.75" fill="white" />
      </Box>
    </motion.div>
  );
}
