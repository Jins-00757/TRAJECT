// src/pages/ApplicationDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Stack,
  Group,
  Text,
  Title,
  Card,
  Timeline,
  Anchor,
  Button,
  ActionIcon,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconBuilding,
  IconPlus,
  IconTrash,
  IconCheck,
  IconX,
  IconCalendarPlus,
  IconBrandGoogle,
} from "@tabler/icons-react";
import {
  buildInterviewICS,
  downloadICS,
  buildGoogleCalendarUrl,
} from "../lib/ics";
import { getApplication } from "../api/applications";
import { deleteInterview } from "../api/interviews";
import { formatSalary, formatDate } from "../lib/format";
import StatusBadge from "../components/applications/StatusBadge";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";
import LogInterviewModal from "../components/interviews/LogInterviewModal";
import DocumentsCard from "../components/applications/DocumentsCard";
import { QualityScoreCard } from "../components/QualityScoreCard";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);
  const [logModalOpen, setLogModalOpen] = useState(false);

  const [loadedForId, setLoadedForId] = useState(id);
  if (id !== loadedForId) {
    setLoadedForId(id);
    setApplication(null);
    setError(null);
  }

  // Bumped to force a re-fetch of the same id — used both for the error
  // Retry button and to pull fresh data after logging/deleting an
  // interview, since interviews are embedded on this same record.
  const [retryToken, setRetryToken] = useState(0);
  const refresh = () => setRetryToken((t) => t + 1);

  useEffect(() => {
    let cancelled = false;
    getApplication(id)
      .then((data) => {
        if (!cancelled) {
          setApplication(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id, retryToken]);

  function retry() {
    setApplication(null);
    setError(null);
    refresh();
  }

  function handleAddToCalendar(iv) {
    try {
      const ics = buildInterviewICS({
        uid: `interview-${iv.id}@traject.app`,
        dateStr: iv.date,
        durationMinutes: 60,
        summary: `${iv.round} interview — ${application.role} at ${application.company?.name ?? "—"}`,
        description: [
          `Interviewer: ${iv.interviewer}`,
          `Format: ${iv.format}`,
          iv.notes ? `Notes: ${iv.notes}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        location:
          iv.format === "onsite"
            ? (application.company?.hqCity ?? "")
            : iv.format,
      });
      downloadICS(
        `${application.role.replace(/\s+/g, "-").toLowerCase()}-${iv.round}`,
        ics,
      );
    } catch (err) {
      notifications.show({
        title: "Couldn't create calendar file",
        message: err.message,
        color: "red",
      });
    }
  }

  function confirmDeleteInterview(interview) {
    modals.openConfirmModal({
      title: "Delete this interview?",
      children: (
        <Text size="sm">
          {interview.round} with {interview.interviewer} — this can't be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteInterview(interview.id);
          notifications.show({ message: "Interview deleted", color: "gray" });
          refresh();
        } catch (err) {
          notifications.show({
            title: "Couldn't delete interview",
            message: err.message,
            color: "red",
            icon: <IconX size={16} />,
          });
        }
      },
    });
  }

  function handleAddToGoogleCalendar(iv) {
    try {
      const url = buildGoogleCalendarUrl({
        dateStr: iv.date,
        durationMinutes: 60,
        summary: `${iv.round} interview — ${application.role} at ${application.company?.name ?? "—"}`,
        description: [
          `Interviewer: ${iv.interviewer}`,
          `Format: ${iv.format}`,
          iv.notes ? `Notes: ${iv.notes}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        location:
          iv.format === "onsite"
            ? (application.company?.hqCity ?? "")
            : iv.format,
      });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      notifications.show({
        title: "Couldn't open Google Calendar",
        message: err.message,
        color: "red",
      });
    }
  }

  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!application) return <Loader label="Loading application…" />;

  return (
    <Stack gap="md">
      
      <Anchor component={Link} to="/applications" size="sm">
        <Group gap={4}>
          <IconArrowLeft size={14} /> Back to applications
        </Group>
      </Anchor>

      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>{application.role}</Title>
          <Group gap={6} c="dimmed">
            <IconBuilding size={16} />
            <Text>{application.company?.name ?? "Unknown company"}</Text>
          </Group>
        </div>
        <StatusBadge status={application.status} />
      </Group>

      <Card withBorder>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Salary
            </Text>
            <Text size="sm">
              {formatSalary(
                application.salaryMin,
                application.salaryMax,
                application.currency,
              )}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Work mode
            </Text>
            <Text size="sm" tt="capitalize">
              {application.workMode}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Applied
            </Text>
            <Text size="sm">{formatDate(application.appliedDate)}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Source
            </Text>
            <Text size="sm">{application.source}</Text>
          </Group>
        </Stack>
      </Card>

      <DocumentsCard applicationId={id}/>

      <Group justify="space-between" mb="sm">
        <Text fw={600}>Interview timeline</Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlus size={14} />}
          onClick={() => setLogModalOpen(true)}
        >
          Log interview
        </Button>
      </Group>

      <div>
        {application.interviews?.length ? (
          <Timeline active={application.interviews.length} bulletSize={20}>
            {application.interviews.map((iv) => (
              <Timeline.Item
                key={iv.id}
                title={iv.round}
                lineVariant={iv.outcome === "failed" ? "dashed" : "solid"}
              >
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <div>
                    <Text size="sm" c="dimmed">
                      {iv.interviewer} · {iv.format}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {formatDate(iv.date)} — {iv.outcome}
                    </Text>
                  </div>
                  <Group gap={4} style={{ flexShrink: 0 }}>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => handleAddToGoogleCalendar(iv)}
                      aria-label="Add to Google Calendar"
                    >
                      <IconBrandGoogle size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => handleAddToCalendar(iv)}
                      aria-label="Download .ics calendar file"
                    >
                      <IconCalendarPlus size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => confirmDeleteInterview(iv)}
                      aria-label="Delete interview"
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <Text size="sm" c="dimmed">
            No interviews logged yet.
          </Text>
        )}
      </div>
      <QualityScoreCard application={application} />

      <Button
        component={Link}
        to={`/applications/${id}/edit`}
        variant="light"
        style={{ alignSelf: "flex-start" }}
      >
        Edit
      </Button>

      <LogInterviewModal
        opened={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        applicationId={id}
        onCreated={() => {
          setLogModalOpen(false);
          notifications.show({
            title: "Interview logged",
            color: "teal",
            icon: <IconCheck size={16} />,
          });
          refresh();
        }}
      />
    </Stack>
  );
}
