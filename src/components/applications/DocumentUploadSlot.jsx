// src/components/applications/DocumentUploadSlot.jsx
import { useRef, useState } from "react";
import { Group, Text, Button, ActionIcon, Stack, Progress } from "@mantine/core";
import { IconUpload, IconFileText, IconX, IconEye, IconDownload } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  validateFile,
  readFileAsDataUrl,
  formatFileSize,
  fileTypeLabel,
} from "../../lib/documentStorage";

const ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// One upload slot — "resume" or "coverLetter" — rendered twice by
// DocumentsCard. Handles its own file picking, validation, and preview;
// the parent only owns which document is currently saved for this slot
// and what happens on save/remove.
export default function DocumentUploadSlot({ label, document, onSave, onRemove }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e) {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = ""; // lets the same file be re-selected later (e.g. after removing it)
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      notifications.show({ title: "Couldn't attach file", message: validationError, color: "red" });
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onSave({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
        uploadedAt: new Date().toISOString(),
      });
      notifications.show({ message: `${file.name} attached`, color: "teal", autoClose: 2000 });
    } catch (err) {
      notifications.show({ title: "Couldn't read file", message: err.message, color: "red" });
    } finally {
      setUploading(false);
    }
  }

  function handlePreview() {
    // data: URLs opened directly in a new tab render natively for PDFs in
    // every major browser; Word docs will typically trigger a download
    // instead of an inline preview, which is expected browser behavior,
    // not a bug in this component.
    window.open(document.dataUrl, "_blank", "noopener,noreferrer");
  }

  function handleDownload() {
    // This component's `document` PROP (the uploaded file's metadata —
    // name/size/dataUrl) shadows the global `document` (the DOM) inside
    // this function's scope. `window.document` sidesteps that — using the
    // bare global here would silently resolve to the prop instead and
    // throw, since the file-metadata object has no `createElement` method.
    const link = window.document.createElement("a");
    link.href = document.dataUrl;
    link.download = document.name;
    window.document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <Stack gap={6}>
      <Text size="sm" fw={500}>{label}</Text>

      {!document ? (
        <>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconUpload size={14} />}
            onClick={() => inputRef.current?.click()}
            loading={uploading}
            style={{ alignSelf: "flex-start" }}
          >
            Upload {label.toLowerCase()}
          </Button>
          <Text size="xs" c="dimmed">PDF, DOC, or DOCX — up to 5MB</Text>
        </>
      ) : (
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
            <IconFileText size={18} style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <Text size="sm" truncate="end">{document.name}</Text>
              <Text size="xs" c="dimmed">
                {fileTypeLabel(document.type)} · {formatFileSize(document.size)}
              </Text>
            </div>
          </Group>
          <Group gap={4} style={{ flexShrink: 0 }}>
            <ActionIcon variant="subtle" size="sm" onClick={handlePreview} aria-label={`Preview ${label.toLowerCase()}`}>
              <IconEye size={14} />
            </ActionIcon>
            <ActionIcon variant="subtle" size="sm" onClick={handleDownload} aria-label={`Download ${label.toLowerCase()}`}>
              <IconDownload size={14} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" size="sm" onClick={onRemove} aria-label={`Remove ${label.toLowerCase()}`}>
              <IconX size={14} />
            </ActionIcon>
          </Group>
        </Group>
      )}

      {uploading && <Progress value={100} animated size="xs" />}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </Stack>
  );
}