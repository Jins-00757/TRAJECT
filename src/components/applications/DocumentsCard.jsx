// src/components/applications/DocumentsCard.jsx
import { useState } from "react";
import { Card, Stack, Text, Divider } from "@mantine/core";
import { getDocuments, setDocument, removeDocument } from "../../lib/documentStorage";
import DocumentUploadSlot from "./DocumentUploadSlot";

// Reads/writes localStorage directly rather than through
// ApplicationsContext — these attachments are explicitly NOT part of the
// backend data model (see documentStorage.js), so they don't belong in the
// same state tree as fields that actually PATCH to json-server. Keeping
// them separate avoids ever accidentally sending a multi-hundred-KB data
// URL to the mock API.
export default function DocumentsCard({ applicationId }) {
  const [documents, setDocuments] = useState(() => getDocuments(applicationId));

  function handleSave(slot, doc) {
    setDocuments(setDocument(applicationId, slot, doc));
  }

  function handleRemove(slot) {
    setDocuments(removeDocument(applicationId, slot));
  }

  return (
    <Card withBorder>
      <Stack gap={4} mb="sm">
        <Text fw={600} size="sm">Documents</Text>
        <Text size="xs" c="dimmed">
          Saved in this browser only — not part of the backend, so it won't follow you to another device.
        </Text>
      </Stack>

      <Stack gap="md">
        <DocumentUploadSlot
          label="Resume"
          document={documents.resume}
          onSave={(doc) => handleSave("resume", doc)}
          onRemove={() => handleRemove("resume")}
        />
        <Divider />
        <DocumentUploadSlot
          label="Cover letter"
          document={documents.coverLetter}
          onSave={(doc) => handleSave("coverLetter", doc)}
          onRemove={() => handleRemove("coverLetter")}
        />
      </Stack>
    </Card>
  );
}