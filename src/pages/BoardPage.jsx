// src/pages/BoardPage.jsx
import { useMemo, useState } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Group, Text, Stack, Button, Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useApplications } from "../context/ApplicationsContext";
import { STATUSES, STATUS_MAP } from "../lib/statusConfig";
import BoardColumn from "../components/board/BoardColumn";
import { BoardCardOverlay } from "../components/board/BoardCard";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";
import { celebrateOffer } from "../lib/confetti";

export default function BoardPage() {
  const { applications, loading, error, refetch, patchApplication } =
    useApplications();
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // One array per status, sorted by `order` ascending. This is the ONLY
  // source of truth for the board — there's no separate local mirror of
  // context state that has to be kept in sync with it (a common source of
  // bugs in Kanban tutorials, and exactly the kind of "two copies of the
  // same state drifting apart" problem this project has been avoiding
  // since Day 2's setState-in-Effect fixes). Live drag feedback comes from
  // dnd-kit's DragOverlay below instead of mutating this derived state
  // mid-drag.
  const columns = useMemo(() => {
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s.value, []]));
    for (const a of applications) {
      (byStatus[a.status] ??= []).push(a);
    }
    Object.values(byStatus).forEach((list) =>
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    );
    return byStatus;
  }, [applications]);

  const activeApplication = applications.find((a) => a.id === activeId);

  function findColumnOf(id) {
    return STATUSES.find((s) => columns[s.value].some((a) => a.id === id))
      ?.value;
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const sourceStatus = findColumnOf(active.id);
    // over.id is either another card's id (dropped near a card) or a
    // column's own status value (dropped on an empty/mostly-empty column).
    const destStatus = STATUSES.some((s) => s.value === over.id)
      ? over.id
      : findColumnOf(over.id);
    if (!sourceStatus || !destStatus) return;

    const moved = applications.find((a) => a.id === active.id);
    if (!moved) return;

    const destItems = columns[destStatus].filter((a) => a.id !== active.id);
    const overIndex = destItems.findIndex((a) => a.id === over.id);
    const destIndex = overIndex === -1 ? destItems.length : overIndex;

    const prevOrder =
      destIndex > 0 ? destItems[destIndex - 1].order : undefined;
    const nextOrder =
      destIndex < destItems.length ? destItems[destIndex].order : undefined;
    // Fractional ("lexicographic") ordering: the moved card's new order
    // sits exactly between its new neighbours' order values. This means a
    // drag only ever PATCHes the ONE card that moved — never every card in
    // the column — the same technique Trello/Linear/Notion use for drag
    // reordering, and it avoids a flood of network calls per drag.
    const newOrder =
      prevOrder === undefined && nextOrder === undefined
        ? 0
        : prevOrder === undefined
          ? nextOrder - 1
          : nextOrder === undefined
            ? prevOrder + 1
            : (prevOrder + nextOrder) / 2;

    if (
      sourceStatus === destStatus &&
      newOrder === moved.order &&
      destStatus === moved.status
    ) {
      return; // dropped back where it started — nothing to persist
    }

    const statusChanged = sourceStatus !== destStatus;
    const patch = { order: newOrder };
    if (statusChanged) {
      patch.status = destStatus;
      patch.lastActivityDate = new Date().toISOString().slice(0, 10);
    }

    try {
      await patchApplication(moved.id, patch);
      if (statusChanged) {
        if (destStatus === "offer") celebrateOffer();
        const fromLabel = STATUS_MAP[sourceStatus].label;
        const toLabel = STATUS_MAP[destStatus].label;
        const id = notifications.show({
          message: (
            <Group justify="space-between" wrap="nowrap" gap="sm">
              <Text size="sm">
                {destStatus === "offer" ? "🎉 " : ""}{moved.role} moved {fromLabel} → {toLabel}
              </Text>
              <Button
                size="xs"
                variant="white"
                onClick={async () => {
                  notifications.hide(id);
                  await patchApplication(moved.id, {
                    status: sourceStatus,
                    order: moved.order,
                    lastActivityDate: moved.lastActivityDate,
                  });
                }}
              >
                Undo
              </Button>
            </Group>
          ),
          color: "teal",
          autoClose: 6000,
        });
      }
    } catch (err) {
      notifications.show({
        title: "Couldn't move application",
        message: err.message,
        color: "red",
      });
    }
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (loading) return <Loader label="Loading board…" />;

  return (
    <Stack gap="md" style={{ minWidth: 0 }}>
      <Text fw={700} size="xl">
        Board
      </Text>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(event) => setActiveId(event.active.id)}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        {/* Horizontal scroll on mobile is the correct mobile-first choice
            here, unlike every other page in this app — a Kanban board's
            whole point is seeing stages side by side, so stacking columns
            vertically (the usual mobile-first move) would defeat the
            board's purpose instead of just reflowing it. */}
        <Box
          style={{
            display: "flex",
            gap: 16,
            overflowX: "auto",
            paddingBottom: 8,
          }}
        >
          {STATUSES.map((s) => (
            <BoardColumn
              key={s.value}
              status={s.value}
              label={s.label}
              color={s.color}
              applications={columns[s.value]}
            />
          ))}
        </Box>

        <DragOverlay>
          {activeApplication ? (
            <BoardCardOverlay application={activeApplication} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </Stack>
  );
}
