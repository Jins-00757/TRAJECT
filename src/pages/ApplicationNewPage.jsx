// src/pages/ApplicationNewPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import ApplicationForm from "../components/applications/ApplicationForm";
import { getCompanies } from "../api/companies";
import { useApplications } from "../context/ApplicationsContext";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";


const NEW_APPLICATION_DEFAULTS = { status: "wishlist", currency: "EUR", priority: 0, tags: [] };

export default function ApplicationNewPage() {
  const navigate = useNavigate();
  const { addApplication } = useApplications();

  const [companies, setCompanies] = useState(null);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    // No synchronous setState here — same "calling setState synchronously
    // within an Effect" fix from Day 2. The loading reset on retry happens
    // in retry() below (an event handler), not in this Effect body.
    let cancelled = false;
    getCompanies()
      .then((data) => {
        if (!cancelled) {
          setCompanies(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => { cancelled = true; };
  }, [retryToken]);

  function retry() {
    setCompanies(null);
    setError(null);
    setRetryToken((t) => t + 1);
  }

  async function handleSubmit(values) {
    const today = new Date().toISOString().slice(0, 10);
    const payload = {
      ...values,
      companyId: Number(values.companyId),
      salaryMin: values.salaryMin === "" || values.salaryMin == null ? null : Number(values.salaryMin),
      salaryMax: values.salaryMax === "" || values.salaryMax == null ? null : Number(values.salaryMax),
      priority: values.priority ?? 0,
      tags: values.tags ?? [],
      notes: values.notes ?? "",
      appliedDate: today,
      lastActivityDate: today,
    };
    try {
      const created = await addApplication(payload);
      notifications.show({
        title: "Application added",
        message: `${values.role} saved to your pipeline.`,
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      navigate(`/applications/${created.id}`);
    } catch (err) {
      notifications.show({ title: "Couldn't save", message: err.message, color: "red", icon: <IconX size={16} /> });
    }
  }

  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!companies) return <Loader label="Loading form…" />;

  return (
    <Stack gap="md">
      <Text fw={700} size="xl">New application</Text>
      <ApplicationForm
        companies={companies}
        onCompanyCreated={(c) => setCompanies((prev) => [...prev, c])}
        onSubmit={handleSubmit}
        submitLabel="Add application"
        initialValues={NEW_APPLICATION_DEFAULTS}
      />
    </Stack>
  );
}