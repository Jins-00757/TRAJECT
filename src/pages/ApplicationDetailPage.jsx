// src/pages/ApplicationDetailPage.jsx
import { useCallback, useEffect, useState, useRef } from "react";
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
import { calculateQualityScore, getQualityStatus } from '../lib/qualityScoreCalculator';
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
  const [qualityScore, setQualityScore] = useState(0);

  // Refs for cleanup and mounted check
  const isMountedRef = useRef(true);
  const checkIntervalRef = useRef(null);

  
  // Bumped to force a re-fetch of the same id — used both for the error
  // Retry button and to pull fresh data after logging/deleting an
  // interview, since interviews are embedded on this same record.
  const [retryToken, setRetryToken] = useState(0);
  const refresh = useCallback(() => {
    setRetryToken((t) => t + 1);
  }, []);

  /**
   * Recalculate quality score
   * Called when application data changes or files are uploaded
   */
  const updateQualityScore = useCallback((app) => {
    if (!app || !isMountedRef.current) return;

    try {
      const score = calculateQualityScore(app);
      setQualityScore(score);
    } catch (err) {
      console.error("Error calculating quality score:", err);
    }
  }, []);

 /**
 * Retry handler
 */
const retry = useCallback(() => {
  setApplication(null);
  setQualityScore(0);
  setError(null);
  refresh();
}, [refresh]);

/**
 * Reset state when application ID changes
 */
// eslint-disable-next-line react-hooks/set-state-in-effect
useEffect(() => {
  setApplication(null);
  setQualityScore(0);
  setError(null);
}, [id]);

/**
 * Real-time quality score updates
 * Detects when resume/cover letter are uploaded to localStorage
 */
useEffect(() => {
  if (!application || !isMountedRef.current) return;

  // Listen for storage changes from other tabs/windows
  const handleStorageChange = (e) => {
    if (
      e.key === `resume_${application.id}` ||
      e.key === `coverLetter_${application.id}`
    ) {
      updateQualityScore(application);
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Check every 500ms for localStorage changes in THIS tab
  const intervalId = setInterval(() => {
    if (isMountedRef.current && application) {
      updateQualityScore(application);
    }
  }, 500);

  checkIntervalRef.current = intervalId;

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    clearInterval(intervalId);
  };
}, [application, updateQualityScore]);

/**
 * Fetch application data
 */
useEffect(() => {
  let cancelled = false;

  getApplication(id)
    .then((data) => {
      if (!cancelled && isMountedRef.current) {
        setApplication(data);
        setError(null);
        updateQualityScore(data);
      }
    })
    .catch((err) => {
      if (!cancelled && isMountedRef.current) {
        setError(err.message);
      }
    });

  return () => {
    cancelled = true;
  };
}, [id, retryToken, updateQualityScore]);

  /**
   * Download interview as .ics file
   */
  const handleAddToCalendar = useCallback(
    (iv) => {
      try {
        const ics = buildInterviewICS({
          uid: `interview-${iv.id}@traject.app`,
          dateStr: iv.date,
          durationMinutes: 60,
          summary: `${iv.round} interview — ${application.role} at ${
            application.company?.name ?? "—"
          }`,
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
    },
    [application],
  );

  /**
   * Confirm and delete interview
   */
  const confirmDeleteInterview = useCallback(
    (interview) => {
      modals.openConfirmModal({
        title: "Delete this interview?",
        children: (
          <Text size="sm">
            {interview.round} with {interview.interviewer} — this can't be
            undone.
          </Text>
        ),
        labels: { confirm: "Delete", cancel: "Cancel" },
        confirmProps: { color: "red" },
        onConfirm: async () => {
          try {
            await deleteInterview(interview.id);
            notifications.show({
              message: "Interview deleted",
              color: "gray",
            });
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
    },
    [refresh],
  );

  /**
   * Add interview to Google Calendar
   */
  const handleAddToGoogleCalendar = useCallback(
    (iv) => {
      try {
        const url = buildGoogleCalendarUrl({
          dateStr: iv.date,
          durationMinutes: 60,
          summary: `${iv.round} interview — ${application.role} at ${
            application.company?.name ?? "—"
          }`,
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
    },
    [application],
  );

  /**
   * Handle interview logged
   */
  const handleInterviewLogged = useCallback(() => {
    setLogModalOpen(false);
    notifications.show({
      title: "Interview logged",
      color: "teal",
      icon: <IconCheck size={16} />,
    });
    refresh();
  }, [refresh]);

  /**
   * Handle documents updated (resume/cover letter)
   * This callback is passed to DocumentsCard to trigger quality score update
   */
  const handleDocumentsUpdated = useCallback(() => {
    if (application && isMountedRef.current) {
      updateQualityScore(application);
    }
  }, [application, updateQualityScore]);

  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!application) return <Loader label="Loading application…" />;

  const qualityStatus = getQualityStatus(qualityScore);

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
       {/* Documents card - Pass callback for quality score updates */}
      <DocumentsCard
        applicationId={id}
        onDocumentsUpdated={handleDocumentsUpdated}
      />

      {/* Quality Score Card - Real-time updates */}
      <QualityScoreCard
        application={application}
        qualityScore={qualityScore}
        qualityStatus={qualityStatus}
      />

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
        onCreated={handleInterviewLogged}/> 
          
    </Stack>
  );
}
