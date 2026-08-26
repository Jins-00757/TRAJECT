import {
  calculateQualityScore,
  getQualityStatus,
} from "../lib/qualityScoreCalculator";
import { Group, Text, Badge} from '@mantine/core';


const ApplicationCard = ({application}) => {

// Inside ApplicationCard component, in your header Group: 
<Group justify="space-between" align="flex-start">
     <div> 
        <Text fw={600}>{application.company}</Text>
         <Text size="sm" c="dimmed">{application.position}</Text>
          </div> 
          <Group gap="xs">
             <Badge color={getQualityStatus(calculateQualityScore(application)).color} variant="light" > {calculateQualityScore(application)}% </Badge> 
             <Text size="xs" c="dimmed"> {getQualityStatus(calculateQualityScore(application)).status} </Text>
              </Group> 
</Group>
}
export default ApplicationCard;