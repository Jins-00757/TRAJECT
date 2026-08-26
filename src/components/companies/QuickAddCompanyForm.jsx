// src/components/companies/QuickAddCompanyForm.jsx
import { useMemo, useState } from "react";
import { Alert, Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { createCompany } from "../../api/companies";
import { findDuplicateCompany } from "../../lib/similarity";

// Shared by every entry point that can create a company: the quick-add
// modal inside ApplicationForm, and the standalone "Add company" button on
// CompaniesPage. Kept in its own file so the duplicate-detection logic
// only exists once.
export default function QuickAddCompanyForm({ companies, onCancel, onCreated }) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [forceCreate, setForceCreate] = useState(false);

  // Recomputed on every keystroke — cheap, since it only scans the
  // already-loaded `companies` array in memory, no network call.
  const duplicate = useMemo(
    () => (name.trim() ? findDuplicateCompany(name, companies) : null),
    [name, companies],
  );

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Company name is required");
      return;
    }
    // Non-blocking by design: the warning below offers a way past this
    // (use existing / create anyway) rather than a disabled submit button.
    if (duplicate && !forceCreate) {
      setError("Choose an option above before adding.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createCompany({ name: name.trim(), website: website.trim() });
      onCreated(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="sm">
        <TextInput
          label="Company name"
          value={name}
          onChange={(e) => {
            setName(e.currentTarget.value);
            setForceCreate(false); // typing again re-arms the warning
          }}
          withAsterisk
          data-autofocus
        />
        <TextInput
          label="Website"
          placeholder="https://…"
          value={website}
          onChange={(e) => setWebsite(e.currentTarget.value)}
        />

        {duplicate && !forceCreate && (
          <Alert
            color="yellow"
            icon={<IconAlertTriangle size={16} />}
            title={duplicate.kind === "exact" ? "This company already exists" : "Similar company found"}
          >
            <Stack gap={8}>
              <Text size="sm">
                {duplicate.company.name} is already in your list
                {duplicate.kind === "fuzzy" ? " — check this isn't a typo" : ""}.
              </Text>
              <Group gap="xs">
                <Button size="xs" onClick={() => onCreated(duplicate.company)}>
                  Use {duplicate.company.name}
                </Button>
                <Button size="xs" variant="subtle" onClick={() => setForceCreate(true)}>
                  Create anyway
                </Button>
              </Group>
            </Stack>
          </Alert>
        )}

        {error && <Text size="sm" c="red">{error}</Text>}
        <Group justify="flex-end">
          <Button variant="subtle" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit" loading={saving}>Add company</Button>
        </Group>
      </Stack>
    </form>
  );
}