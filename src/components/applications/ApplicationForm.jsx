// src/components/applications/ApplicationForm.jsx
import { useState } from "react";
import { Form } from "react-final-form";
import {
  Stack, SimpleGrid, TextInput, Select, NumberInput, Textarea,
  TagsInput, Rating, Button, Group, Text, Modal,
} from "@mantine/core";
import { FinalField } from "../form/FinalField";
import { required, isUrl } from "../../lib/validators";
import { STATUS_OPTIONS } from "../../lib/statusConfig";
import { createCompany } from "../../api/companies";

const WORK_MODE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];
const CURRENCY_OPTIONS = ["EUR", "USD", "GBP"].map((c) => ({ value: c, label: c }));

// Whole-record validation for rules that span two fields — final-form calls
// this with the full values object and expects { fieldName: error }.
function validateForm(values) {
  const errors = {};
  if (
    values.salaryMin !== "" && values.salaryMin != null &&
    values.salaryMax !== "" && values.salaryMax != null &&
    Number(values.salaryMax) < Number(values.salaryMin)
  ) {
    errors.salaryMax = "Must be ≥ minimum salary";
  }
  return errors;
}

export default function ApplicationForm({ initialValues, companies, onCompanyCreated, onSubmit, submitLabel }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const companyOptions = companies.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <Form
      initialValues={initialValues}
      validate={validateForm}
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, form }) => (
        // The quick-add company Modal is a SIBLING of <form>, not a child —
        // see the bug box below for why that matters.
        <>
          <form onSubmit={handleSubmit} noValidate>
            <Stack gap="md">
              <FinalField
                name="role" component={TextInput} label="Role"
                placeholder="e.g. Frontend Developer" validate={required()} withAsterisk
              />

              <Group align="flex-end" gap="xs" wrap="nowrap">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <FinalField
                    name="companyId" component={Select} label="Company"
                    placeholder="Select a company" data={companyOptions}
                    searchable validate={required()} withAsterisk
                  />
                </div>
                <Button variant="light" type="button" onClick={() => setQuickAddOpen(true)} style={{ flexShrink: 0 }}>
                  + New
                </Button>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <FinalField name="status" component={Select} label="Stage" data={STATUS_OPTIONS} validate={required()} withAsterisk />
                <FinalField name="workMode" component={Select} label="Work mode" data={WORK_MODE_OPTIONS} />
              </SimpleGrid>

              <FinalField name="location" component={TextInput} label="Location" placeholder="e.g. Lisbon, PT" />

              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <FinalField name="salaryMin" component={NumberInput} label="Salary min" min={0} thousandSeparator="," />
                <FinalField name="salaryMax" component={NumberInput} label="Salary max" min={0} thousandSeparator="," />
                <FinalField name="currency" component={Select} label="Currency" data={CURRENCY_OPTIONS} />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <FinalField name="source" component={TextInput} label="Source" placeholder="e.g. LinkedIn, Referral" />
                <FinalField name="jobUrl" component={TextInput} label="Job posting URL" placeholder="https://…" validate={isUrl()} />
              </SimpleGrid>

              <div>
                <Text size="sm" fw={500} mb={4}>Priority</Text>
                <FinalField name="priority" component={Rating} count={3} />
              </div>

              <FinalField name="tags" component={TagsInput} label="Tags" placeholder="Press Enter to add" />
              <FinalField name="notes" component={Textarea} label="Notes" autosize minRows={2} />

              {/* No disabled={invalid}: disabled submit buttons are a known
                  accessibility anti-pattern. Letting the click through lets
                  final-form mark every field touched and FinalField's
                  meta.submitFailed check surface every error at once. */}
              <Group justify="flex-end" mt="sm">
                <Button type="submit" loading={submitting}>{submitLabel}</Button>
              </Group>
            </Stack>
          </form>

          <Modal opened={quickAddOpen} onClose={() => setQuickAddOpen(false)} title="Add a company" centered>
            <QuickAddCompanyForm
              onCancel={() => setQuickAddOpen(false)}
              onCreated={(company) => {
                onCompanyCreated(company);
                form.change("companyId", String(company.id));
                setQuickAddOpen(false);
              }}
            />
          </Modal>
        </>
      )}
    />
  );
}

function QuickAddCompanyForm({ onCancel, onCreated }) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Company name is required");
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
        <TextInput label="Company name" value={name} onChange={(e) => setName(e.currentTarget.value)} withAsterisk data-autofocus />
        <TextInput label="Website" placeholder="https://…" value={website} onChange={(e) => setWebsite(e.currentTarget.value)} />
        {error && <Text size="sm" c="red">{error}</Text>}
        <Group justify="flex-end">
          <Button variant="subtle" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit" loading={saving}>Add company</Button>
        </Group>
      </Stack>
    </form>
  );
}