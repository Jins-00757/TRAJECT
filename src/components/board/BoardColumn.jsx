// src/components/board/BoardColumn.jsx
import { Box, Text, Group } from "@mantine/core";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import BoardCard from "./BoardCard";

export default function BoardColumn({ status, label, color, applications }) {
  // A column must ALSO be a droppable in its own right, not just host a
  // SortableContext — a column with zero cards has no card-level drop
  // targets registered at all, so without this, dropping onto an empty
  // column would have nowhere to land.
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const ids = applications.map((a) => a.id);

  return (
    <Box w={272} style={{ flexShrink: 0 }}>
      <Group justify="space-between" mb="xs">
        <Group gap={6}>
          <Box
            w={8}
            h={8}
            bg={color}
            style={{ borderRadius: 999, flexShrink: 0 }}
          />
          <Text fw={600} size="sm">
            {label}
          </Text>
        </Group>
        <Text size="xs" c="dimmed">
          {applications.length}
        </Text>
      </Group>

      <Box
        ref={setNodeRef}
        p="xs"
        mih={120}
        style={{
          background: isOver
            ? "var(--mantine-color-teal-0)"
            : "var(--mantine-color-gray-0)",
          borderRadius: 8,
          transition: "background 120ms ease",
        }}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {applications.map((a) => (
            <BoardCard key={a.id} application={a} />
          ))}
          {applications.length === 0 && (
            <Text size="xs" c="dimmed" ta="center" py="md">
              Drop here
            </Text>
          )}
        </SortableContext>
      </Box>
    </Box>
  );
}
