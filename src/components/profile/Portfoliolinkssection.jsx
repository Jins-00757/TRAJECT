// src/components/profile/PortfolioLinksSection.jsx
import { useState } from "react";
import { Stack, Text, TextInput, Group, Button, Anchor } from "@mantine/core";
import { IconBrandGithub, IconBrandLinkedin, IconWorld, IconLink, IconCheck } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  LINK_FIELDS,
  getPortfolioLinks,
  savePortfolioLinks,
  normalizeUrl,
  validateLinkUrl,
} from "../../lib/Portfoliolinks";

const FIELD_ICONS = {
  github: IconBrandGithub,
  linkedin: IconBrandLinkedin,
  portfolio: IconWorld,
  other: IconLink,
};

// A dedicated section for the Profile page — reads/writes the same
// localStorage key regardless of which tab it's placed in, so it works
// whether it's its own "Portfolio" tab or a section inside an existing one.
export default function PortfolioLinksSection() {
  const [values, setValues] = useState(() => {
    const saved = getPortfolioLinks();
    // Every field always has a string value, even if nothing was saved —
    // keeps the TextInputs controlled from the first render.
    return Object.fromEntries(LINK_FIELDS.map((f) => [f.key, saved[f.key] ?? ""]));
  });
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(false);

  function handleChange(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  }

  function handleSave() {
    const nextErrors = {};
    for (const field of LINK_FIELDS) {
      const error = validateLinkUrl(values[field.key]);
      if (error) nextErrors[field.key] = error;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const normalized = Object.fromEntries(
      LINK_FIELDS.map((f) => [f.key, normalizeUrl(values[f.key])]),
    );
    savePortfolioLinks(normalized);
    setValues(normalized);
    setEditing(false);
    notifications.show({ message: "Links saved", color: "teal", icon: <IconCheck size={16} />, autoClose: 2000 });
  }

  function handleCancel() {
    const saved = getPortfolioLinks();
    setValues(Object.fromEntries(LINK_FIELDS.map((f) => [f.key, saved[f.key] ?? ""])));
    setErrors({});
    setEditing(false);
  }

  const hasAnyLink = LINK_FIELDS.some((f) => values[f.key]);

  if (!editing) {
    return (
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600} size="sm">Portfolio links</Text>
          <Button size="xs" variant="light" onClick={() => setEditing(true)}>
            {hasAnyLink ? "Edit" : "Add links"}
          </Button>
        </Group>

        {hasAnyLink ? (
          <Stack gap={6}>
            {LINK_FIELDS.filter((f) => values[f.key]).map((f) => {
              const Icon = FIELD_ICONS[f.key];
              return (
                <Group key={f.key} gap={8}>
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <Anchor href={values[f.key]} target="_blank" rel="noopener noreferrer" size="sm" truncate="end">
                    {values[f.key]}
                  </Anchor>
                </Group>
              );
            })}
          </Stack>
        ) : (
          <Text size="xs" c="dimmed">No links added yet.</Text>
        )}
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <Text fw={600} size="sm">Portfolio links</Text>
      {LINK_FIELDS.map((f) => {
        const Icon = FIELD_ICONS[f.key];
        return (
          <TextInput
            key={f.key}
            label={f.label}
            placeholder={f.placeholder}
            leftSection={<Icon size={16} />}
            value={values[f.key]}
            onChange={(e) => handleChange(f.key, e.currentTarget.value)}
            error={errors[f.key]}
          />
        );
      })}
      <Group justify="flex-end" mt="xs">
        <Button variant="subtle" onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </Group>
    </Stack>
  );
}