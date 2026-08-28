// src/pages/ApplicationEditPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Stack, Text, Group, Button } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX, IconTrash } from "@tabler/icons-react";
import ApplicationForm from "../components/applications/ApplicationForm";
import { getApplication } from "../api/applications";
import { getCompanies } from "../api/companies";
import { useApplications } from "../context/ApplicationsContext";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";
import { celebrateOffer } from "../lib/confetti";

export default function ApplicationEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patchApplication, removeApplication } = useApplications();

  const [application, setApplication] = useState(null);
  const [companies, setCompanies] = useState(null);
  const [error, setError] = useState(null);

  // Same "reset during render, not inside the Effect" pattern from Day 2's
  // Application detail page fix.
  const [loadedForId, setLoadedForId] = useState(id);
  if (id !== loadedForId) {
    setLoadedForId(id);
    setApplication(null);
    setCompanies(null);
    setError(null);
  }

  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getApplication(id), getCompanies()])
      .then(([app, comps]) => {
        if (!cancelled) {
          setApplication(app);
          setCompanies(comps);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => { cancelled = true; };
  }, [id, retryToken]);

  function retry() {
    setApplication(null);
    setCompanies(null);
    setError(null);
    setRetryToken((t) => t + 1);
  }

  async function handleSubmit(values) {
    const payload = {
      role: values.role,
      companyId: Number(values.companyId),
      status: values.status,
      workMode: values.workMode,
      location: values.location,
      salaryMin: values.salaryMin === "" || values.salaryMin == null ? null : Number(values.salaryMin),
      salaryMax: values.salaryMax === "" || values.salaryMax == null ? null : Number(values.salaryMax),
      currency: values.currency,
      source: values.source,
      jobUrl: values.jobUrl,
      priority: values.priority ?? 0,
      tags: values.tags ?? [],
      notes: values.notes ?? "",
      // Editing IS activity — this is what keeps the Dashboard's Recent
      // Activity feed (built Day 2) actually reflecting what you've been
      // working on, instead of forever showing the same 5 seed rows.
      lastActivityDate: new Date().toISOString().slice(0, 10),
    };
    const becameOffer = application.status !== "offer" && values.status === "offer";
  
    try {
      await patchApplication(id, payload);
      if (becameOffer) celebrateOffer();
      notifications.show({
        title: "Application updated",
        message: `${values.role} saved.`,
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      navigate(`/applications/${id}`);
    } catch (err) {
      notifications.show({ title: "Couldn't save", message: err.message, color: "red", icon: <IconX size={16} /> });
    }
  }

  function confirmDelete() {
    modals.openConfirmModal({
      title: "Delete this application?",
      children: <Text size="sm">This can't be undone.</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await removeApplication(id);
          notifications.show({ message: "Application deleted", color: "gray" });
          navigate("/applications");
        } catch (err) {
          notifications.show({ title: "Couldn't delete", message: err.message, color: "red", icon: <IconX size={16} /> });
        }
      },
    });
  }

  // Stable reference, same reasoning as NEW_APPLICATION_DEFAULTS. Keyed on
  // `application` so it only produces a new object when the fetched record
  // itself actually changes — not on every unrelated re-render (e.g. after
  // quick-adding a company from inside the form).
  const initialValues = useMemo(
    () => (application ? { ...application, companyId: String(application.companyId) } : undefined),
    [application]
  );

  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!application || !companies) return <Loader label="Loading…" />;

  return (
    
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={700} size="xl">Edit application</Text>
        <Button color="red" variant="subtle" leftSection={<IconTrash size={16} />} onClick={confirmDelete}>
          Delete
        </Button>
      </Group>
      <ApplicationForm
        companies={companies}
        onCompanyCreated={(c) => setCompanies((prev) => [...prev, c])}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        initialValues={initialValues}
      />
    </Stack>
  );
}