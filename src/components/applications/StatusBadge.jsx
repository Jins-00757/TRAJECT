// src/components/applications/StatusBadge.jsx
import { Badge } from "@mantine/core";
import { STATUS_MAP } from "../../lib/statusConfig";

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status];
  if (!config) return <Badge color="gray">{status}</Badge>;
  return <Badge color={config.color} variant="light">{config.label}</Badge>;
}