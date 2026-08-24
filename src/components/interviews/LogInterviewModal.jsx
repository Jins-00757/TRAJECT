// src/components/interviews/LogInterviewModal.jsx
import { useState } from "react";
import {
  Modal,
  Stack,
  Select,
  TextInput,
  Group,
  Button,
  Text,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { createInterview } from "../../api/interviews";

const ROUND_OPTIONS = [
  "screening",
  "technical",
  "system-design",
  "final",
  "offer",
].map((v) => ({
  value: v,
  label: v.replace("-", " "),
}));
const FORMAT_OPTIONS = ["phone", "video", "onsite"].map((v) => ({
  value: v,
  label: v,
}));
const OUTCOME_OPTIONS = ["pending", "passed", "failed"].map((v) => ({
  value: v,
  label: v,
}));

export default function LogInterviewModal({
  opened,
  onClose,
  applicationId,
  onCreated,
}) {
  const [round, setRound] = useState("screening");
  const [interviewer, setInterviewer] = useState("");
  const [format, setFormat] = useState("video");
  // A "YYYY-MM-DD HH:mm:ss" STRING — see Bug #3 above.
  const [dateStr, setDateStr] = useState(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  const [outcome, setOutcome] = useState("pending");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!interviewer.trim()) {
      setError("Interviewer name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createInterview({
        applicationId: Number(applicationId),
        round,
        interviewer: interviewer.trim(),
        format,
        outcome,
        date: dayjs(dateStr).format("YYYY-MM-DDTHH:mm"), // matches the seed data's date shape
        notes: "",
      });
      onCreated(created);
      setInterviewer("");
      setOutcome("pending");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Log an interview" centered>
      <form onSubmit={submit} noValidate>
        <Stack gap="sm">
          <Select
            label="Round"
            data={ROUND_OPTIONS}
            value={round}
            onChange={setRound}
            allowDeselect={false}
          />
          <TextInput
            label="Interviewer"
            value={interviewer}
            onChange={(e) => setInterviewer(e.currentTarget.value)}
            data-autofocus
            withAsterisk
          />
          <Select
            label="Format"
            data={FORMAT_OPTIONS}
            value={format}
            onChange={setFormat}
            allowDeselect={false}
          />
          <DateTimePicker
            label="Date & time"
            value={dateStr}
            onChange={setDateStr}
          />
          <Select
            label="Outcome"
            data={OUTCOME_OPTIONS}
            value={outcome}
            onChange={setOutcome}
            allowDeselect={false}
          />
          {error && (
            <Text size="sm" c="red">
              {error}
            </Text>
          )}
          <Group justify="flex-end" mt="xs">
            <Button variant="subtle" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Log interview
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
