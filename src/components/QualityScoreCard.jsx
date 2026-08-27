
import { Group, Progress, Stack, Text, Badge, Card } from "@mantine/core";
import {
  calculateQualityScore,
  getQualityStatus,
} from "../lib/qualityScoreCalculator";

export const QualityScoreCard = ({ application }) => {
  const score = calculateQualityScore(application);
  const { status, color, icon } = getQualityStatus(score);

  

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        {/* Header with score */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <Text fw={600} size="sm">
              {" "}
              Quality Score{" "}
            </Text>
            <Badge color={color} variant="light" size="lg">
              {" "}
              {icon} {score}%
            </Badge>
          </Group>
          <Text size="xs" c="dimmed">
            {" "}
            {status}{" "}
          </Text>
        </Group>
        {/* Progress bar */}
        <Progress value={score} color={color} size="md" radius="md" />
        {/* Breakdown */}
        <Stack gap="xs">
          {" "}
          
          <Group justify="space-between" grow>
            <div>
              <Text size="xs" c="dimmed">
                Interviews
              </Text>{" "}
              <Text size="sm" fw={600}>
                {" "}
                {application.interviews
                  ? application.interviews.length
                  : 0}{" "}
                logged{" "}
              </Text>
            </div>{" "}
            <div>
              {" "}
              <Text size="xs" c="dimmed">
                Follow-up
              </Text>{" "}
              <Text size="sm" fw={600}>
                {" "}
                {application.followUpDate && application.followUpDate.trim()
                  ? "✓ Set"
                  : "✗ None"}{" "}
              </Text>{" "}
            </div>{" "}
          </Group>{" "}
        </Stack>{" "}
      </Stack>{" "}
    </Card>
  );
};
