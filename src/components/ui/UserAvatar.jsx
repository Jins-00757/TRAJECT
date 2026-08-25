// src/components/ui/UserAvatar.jsx
import { Avatar, Tooltip, Group } from '@mantine/core';
import { getInitials, getColorForString } from '../../lib/imageUtils';

/**
 * Smart avatar component with intelligent fallback.
 * 
 * Props:
 * - name: string (required) - used for initials + tooltip
 * - image: string (optional) - base64 image URL
 * - size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * - radius: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'xl')
 * - showTooltip: boolean (default: false) - show name on hover
 * - onClick: function (optional) - handle click (e.g., navigate to profile)
 * - variant: string (optional) - Mantine avatar variant
 */
export default function UserAvatar({
  name = 'User',
  image = null,
  size = 'md',
  radius = 'xl',
  showTooltip = false,
  onClick = null,
  variant = 'light',
}) {
  const initials = getInitials(name);
  const color = getColorForString(name);

  // Base avatar component
  const avatar = (
    <Avatar
      src={image}
      alt={name}
      name={initials}
      color={color}
      size={size}
      radius={radius}
      variant={variant}
      style={{
        fontWeight: 600,
        fontSize: size === 'xs' ? '10px' : size === 'sm' ? '11px' : '12px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    />
  );

  // Wrap with tooltip if requested
  if (showTooltip) {
    return (
      <Tooltip
        label={name}
        withArrow
        openDelay={300}
        closeDelay={100}
      >
        {avatar}
      </Tooltip>
    );
  }

  return avatar;
}

/**
 * Avatar group component - display multiple avatars in a row.
 * Useful for showing team members, interview panels, etc.
 */
export function UserAvatarGroup({ users, max = 3, size = 'md' }) {
  const displayed = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <Group gap={-8} wrap="nowrap">
      {displayed.map((user) => (
        <UserAvatar
          key={user.id || user.name}
          name={user.name}
          image={user.image}
          size={size}
          showTooltip
        />
      ))}
      {remaining > 0 && (
        <Avatar
          size={size}
          color="gray"
          variant="light"
          title={`+${remaining} more`}
        >
          +{remaining}
        </Avatar>
      )}
    </Group>
  );
}