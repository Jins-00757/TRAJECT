// src/components/interviews/InterviewTimelineCard.jsx
import { motion } from 'motion/react';
import {
  Group,
  Text,
  Badge,
  ActionIcon,
  Stack,
  Paper,
  Tooltip,
  Modal,
  Button,
} from '@mantine/core';
import {
  IconTrash,
  IconPhone,
  IconVideo,
  IconMapPin,
  IconClock,
  IconMessageCircle,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useState } from 'react';

const FORMAT_ICON = {
  phone: IconPhone,
  video: IconVideo,
  onsite: IconMapPin,
  async: IconMessageCircle,
};

const STATUS_COLOR = {
  pending: 'orange',
  passed: 'teal',
  failed: 'red',
  scheduled: 'blue',
};

/**
 * Single interview card in the timeline.
 * 
 * Props:
 * - interview: object - interview data
 *   { id, round, format, date, time, interviewer, outcome, notes }
 * - onDelete: function - handle deletion
 * - onEdit: function (optional) - handle edit
 * - index: number (default: 0) - position in list
 * - total: number (default: 1) - total items in list
 */
export default function InterviewTimelineCard({
  interview,
  onDelete,
  onEdit = null,
  index = 0,
  total = 1,
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const Icon = FORMAT_ICON[interview.format] || IconPhone;
  const statusColor = STATUS_COLOR[interview.outcome] || 'gray';

  // Format the interview date
  const interviewDate = new Date(interview.date);
  const dateStr = interviewDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const timeStr = interview.time || '—';

  // Determine if this is the latest/most recent
  const isLatest = index === total - 1;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.05,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <Paper
          withBorder
          p="sm"
          radius="md"
          style={{
            borderLeft: `3px solid var(--mantine-color-${statusColor}-6)`,
            background: isLatest ? `var(--mantine-color-${statusColor}-0)` : 'transparent',
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          className="interview-card-hover"
          onClick={() => setExpanded(!expanded)}
        >
          {/* Header row */}
          <Group justify="space-between" wrap="nowrap" mb="xs">
            <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
              <Tooltip label={interview.format}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon size={16} style={{ flexShrink: 0 }} />
                </div>
              </Tooltip>

              <Text fw={600} size="sm" truncate style={{ flex: 1 }}>
                {interview.round}
              </Text>

              <Badge
                size="xs"
                color={statusColor}
                variant="filled"
                style={{ flexShrink: 0 }}
              >
                {interview.outcome}
              </Badge>

              {isLatest && (
                <Badge
                  size="xs"
                  variant="light"
                  color="gray"
                  style={{ flexShrink: 0 }}
                >
                  Latest
                </Badge>
              )}
            </Group>

            {/* Delete button */}
            <Tooltip label="Delete interview">
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(true);
                }}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Info row */}
          <Stack gap={3} style={{ marginLeft: '24px' }}>
            <Group gap="xs" wrap="nowrap">
              <Text size="sm" c="dimmed" fw={500}>
                {interview.interviewer || 'Unknown'}
              </Text>
              <Text size="xs" c="dimmed">
                •
              </Text>
              <Text size="xs" c="dimmed" tt="capitalize">
                {interview.format}
              </Text>
            </Group>

            <Group gap="xs" wrap="nowrap">
              <IconClock size={12} style={{ color: 'var(--mantine-color-gray-5)', flexShrink: 0 }} />
              <Text size="xs" c="dimmed">
                {dateStr} at {timeStr}
              </Text>
            </Group>
          </Stack>

          {/* Expanded content */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Stack gap="sm" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                {interview.notes && (
                  <div>
                    <Group gap="xs" mb={4}>
                      <IconMessageCircle size={14} />
                      <Text size="xs" fw={500}>
                        Notes
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed" style={{ marginLeft: '20px' }}>
                      "{interview.notes}"
                    </Text>
                  </div>
                )}

                {interview.feedback && (
                  <div>
                    <Group gap="xs" mb={4}>
                      <IconAlertCircle size={14} />
                      <Text size="xs" fw={500}>
                        Feedback
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed" style={{ marginLeft: '20px' }}>
                      {interview.feedback}
                    </Text>
                  </div>
                )}

                {onEdit && (
                  <Button
                    size="xs"
                    variant="light"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(interview);
                    }}
                  >
                    Edit interview
                  </Button>
                )}
              </Stack>
            </motion.div>
          )}
        </Paper>
      </motion.div>

      {/* Delete confirmation modal */}
      <Modal
        opened={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        title="Delete interview?"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            This will permanently remove the {interview.round} interview with {interview.interviewer}.
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                onDelete(interview);
                setDeleteConfirm(false);
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

/**
 * Interview timeline container - renders multiple cards with proper spacing.
 */
export function InterviewTimeline({ interviews = [], onDelete, onEdit }) {
  if (!interviews || interviews.length === 0) {
    return (
      <Paper withBorder p="md" radius="md" ta="center">
        <Text c="dimmed">No interviews scheduled yet.</Text>
      </Paper>
    );
  }

  // Sort by date ascending (oldest first)
  const sorted = [...interviews].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <Stack gap="xs">
      {sorted.map((interview, i) => (
        <InterviewTimelineCard
          key={interview.id || i}
          interview={interview}
          onDelete={onDelete}
          onEdit={onEdit}
          index={i}
          total={sorted.length}
        />
      ))}
    </Stack>
  );
}