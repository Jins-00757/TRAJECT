// src/components/insights/AnimatedStatTile.jsx
import { motion } from 'motion/react';
import { Paper, Text, Group, ThemeIcon } from '@mantine/core';
import { useEffect, useState } from 'react';

/**
 * Counter component that animates from 0 to final value.
 * Uses Framer Motion's animate() function for smooth 60fps counting.
 * 
 * Props:
 * - from: number (default: 0) - start value
 * - to: number (default: 0) - end value
 * - duration: number (default: 0.8) - animation duration in seconds
 * - format: function (optional) - format the number (e.g., (n) => n.toFixed(1))
 */
function AnimatedCounter({ from = 0, to = 0, duration = 0.8, format = null }) {
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    // Use requestAnimationFrame for smooth 60fps animation
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (endTime - startTime), 1);
      
      // Easing function: ease-out-cubic for natural deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * easeOutCubic;
      
      setDisplayValue(Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [to, duration, from]);

  // Apply optional formatting
  const formattedValue = format ? format(displayValue) : displayValue;

  return (
    <span
      style={{
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 600,
      }}
    >
      {formattedValue}
    </span>
  );
}

/**
 * Stat tile with animated counter and icon.
 * 
 * Props:
 * - label: string - label above the number
 * - value: number - final value to count to
 * - sub: string (optional) - subtitle/extra info
 * - icon: React component - Tabler icon
 * - color: string (default: 'teal') - Mantine color
 * - delay: number (default: 0) - animation delay in seconds
 * - trend: number (optional) - trend percentage (e.g., +12)
 * - trendColor: string (optional) - color for trend
 * - format: function (optional) - number formatter
 */
export default function AnimatedStatTile({
  label,
  value,
  sub = null,
  icon: Icon,
  color = 'teal',
  delay = 0,
  trend = null,
  trendColor = null,
  format = null,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.4, 0, 0.2, 1], // cubic-bezier(0.4, 0, 0.2, 1)
      }}
    >
      <Paper
        withBorder
        p="md"
        radius="md"
        style={{
          background: 'var(--mantine-color-gray-0)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `radial-gradient(circle, var(--mantine-color-${color}-1) 0%, transparent 70%)`,
            pointerEvents: 'none',
            opacity: 0.5,
          }}
        />

        <Group justify="space-between" align="flex-start" wrap="nowrap" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Text
              size="xs"
              c="dimmed"
              fw={500}
              tt="uppercase"
              style={{ letterSpacing: '0.5px' }}
            >
              {label}
            </Text>

            <Group align="flex-end" gap={4} mt="sm">
              <Text
                size="xl"
                fw={700}
                style={{
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <AnimatedCounter
                  to={value}
                  duration={0.8}
                  format={format}
                />
              </Text>

              {/* Trend indicator */}
              {trend !== null && (
                <Text
                  size="xs"
                  fw={600}
                  c={trendColor || (trend > 0 ? 'teal' : 'red')}
                  style={{ marginBottom: '2px' }}
                >
                  {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </Text>
              )}
            </Group>

            {sub && (
              <Text size="xs" c="dimmed" mt={4}>
                {sub}
              </Text>
            )}
          </div>

          {Icon && (
            <ThemeIcon
              variant="light"
              color={color}
              size={40}
              radius="md"
              style={{
                flexShrink: 0,
              }}
            >
              <Icon size={24} aria-hidden="true" />
            </ThemeIcon>
          )}
        </Group>
      </Paper>
    </motion.div>
  );
}

/**
 * Export a grid wrapper for easy stat tile arrangements.
 */
export function StatTilesGrid({ tiles = [] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}
    >
      {tiles.map((tile, i) => (
        <AnimatedStatTile
          key={i}
          {...tile}
          delay={(tile.delay || 0) + i * 0.1} // Stagger by 0.1s
        />
      ))}
    </div>
  );
}