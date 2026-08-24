// src/components/board/BoardCard.jsx
import { Card, Text, Group } from "@mantine/core";
import { Link } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatSalary, relativeActivity } from "../../lib/format";

function CardBody({ application }) {
  return (
    <>
      <Text size="sm" fw={600} lineClamp={2}>
        {application.role}
      </Text>
      <Text size="xs" c="dimmed">
        {application.company?.name ?? "—"}
      </Text>
      <Group justify="space-between" mt={6} wrap="nowrap">
        <Text size="xs">
          {formatSalary(
            application.salaryMin,
            application.salaryMax,
            application.currency,
          )}
        </Text>
        <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
          {relativeActivity(application.lastActivityDate)}
        </Text>
      </Group>
    </>
  );
}

export default function BoardCard({ application }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
  });

  return (
    <Card
      ref={setNodeRef}
      component={Link}
      to={`/applications/${application.id}`}
      withBorder
      padding="sm"
      mb="xs"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        // Without this, touch browsers treat the drag gesture as a page
        // scroll before dnd-kit's PointerSensor ever sees the pointerdown —
        // it disables the browser's own touch-scroll handling on the card
        // itself so dnd-kit can claim the gesture instead.
        touchAction: "none",
        cursor: "grab",
        display: "block",
        textDecoration: "none",
        color: "inherit",
      }}
      {...attributes}
      {...listeners}
    >
      <CardBody application={application} />
    </Card>
  );
}

// Rendered inside <DragOverlay> — the floating "ghost" card that follows
// the pointer while dragging. It must NOT call useSortable itself: that
// hook belongs to the one real, still-in-the-list card, and mounting it a
// second time (same id) on the overlay clone registers a duplicate
// sortable node and fights with the original. DragOverlay handles the
// floating/positioning on its own; this is just presentation.
export function BoardCardOverlay({ application }) {
  return (
    <Card
      withBorder
      padding="sm"
      style={{ cursor: "grabbing", boxShadow: "var(--mantine-shadow-md)" }}
    >
      <CardBody application={application} />
    </Card>
  );
}
