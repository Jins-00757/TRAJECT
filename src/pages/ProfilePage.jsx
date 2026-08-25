// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import {
  Stack,
  Text,
  TextInput,
  Button,
  Group,
  Card,
  FileInput,
  Alert,
  Progress,
  Badge,
  Tabs,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconX,
  IconUpload,
  IconAlertTriangle,
  IconRefresh,
  IconShield,
  IconPalette,
} from '@tabler/icons-react';
import UserAvatar from '../components/ui/UserAvatar';
import {
  compressImageToBase64,
  canStoreImage,
  getInitials,
  safeLocalStorageSet,
  safeLocalStorageGet,
} from '../lib/imageUtils';

const PROFILE_STORAGE_KEY = 'traject_user_profile';
const THEME_STORAGE_KEY = 'traject_user_theme';

/**
 * User profile page with avatar upload, settings, and preferences.
 * 
 * Features:
 * - Avatar upload with compression
 * - Name/email storage
 * - Profile picture preview
 * - Settings tabs (Profile, Privacy, Display)
 * - Auto-save with notifications
 * - localStorage persistence
 */
export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savedState, setSavedState] = useState('saved'); // 'saved' | 'unsaved' | 'saving'

  // Load profile from localStorage on mount
  useEffect(() => {
    const stored = safeLocalStorageGet(PROFILE_STORAGE_KEY);
    if (stored) {
      try {
        const profile = JSON.parse(stored);
        setName(profile.name || '');
        setEmail(profile.email || '');
        setAvatarBase64(profile.avatar || null);
        setSavedState('saved');
      } catch (e) {
        console.error('Failed to load profile:', e);
      }
    }
  }, []);

  /**
   * Handle avatar file upload with compression and validation.
   */
  async function handleAvatarUpload(file) {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress (real progress would require event listeners)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 20, 80));
      }, 200);

      const compressed = await compressImageToBase64(file, 600, 0.8);
      clearInterval(progressInterval);

      // Check storage limits
      if (!canStoreImage(compressed)) {
        setShowSizeWarning(true);
        setUploadProgress(0);
        notifications.show({
          title: 'Image too large',
          message: 'After compression, this image still exceeds storage limits. Try a smaller file.',
          color: 'orange',
          icon: <IconAlertTriangle size={16} />,
          autoClose: 4000,
        });
        setUploading(false);
        return;
      }

      setAvatarBase64(compressed);
      setUploadProgress(100);
      setShowSizeWarning(false);
      setSavedState('unsaved');

      notifications.show({
        title: 'Avatar updated',
        message: 'Your new avatar is ready. Save your profile to persist it.',
        color: 'teal',
        icon: <IconCheck size={16} />,
        autoClose: 3000,
      });

      // Reset progress after animation
      setTimeout(() => setUploadProgress(0), 500);
    } catch (err) {
      notifications.show({
        title: 'Upload failed',
        message: err.message,
        color: 'red',
        icon: <IconX size={16} />,
        autoClose: 4000,
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  }

  /**
   * Validate and save profile to localStorage.
   */
  function saveProfile() {
    // Validation
    if (!name.trim()) {
      notifications.show({
        title: 'Name required',
        message: 'Please enter your name.',
        color: 'orange',
        icon: <IconAlertTriangle size={16} />,
      });
      return;
    }

    if (email && !email.includes('@')) {
      notifications.show({
        title: 'Invalid email',
        message: 'Please enter a valid email address.',
        color: 'orange',
        icon: <IconAlertTriangle size={16} />,
      });
      return;
    }

    setSavedState('saving');

    const profile = {
      name: name.trim(),
      email: email.trim(),
      avatar: avatarBase64,
      savedAt: new Date().toISOString(),
    };

    const result = safeLocalStorageSet(
      PROFILE_STORAGE_KEY,
      JSON.stringify(profile)
    );

    if (result.success) {
      setSavedState('saved');
      notifications.show({
        title: 'Profile saved',
        message: `Nice to meet you, ${name}!`,
        color: 'teal',
        icon: <IconCheck size={16} />,
        autoClose: 3000,
      });
    } else {
      setSavedState('unsaved');
      notifications.show({
        title: 'Save failed',
        message: result.error || 'Could not save profile',
        color: 'red',
        icon: <IconX size={16} />,
        autoClose: 4000,
      });
    }
  }

  /**
   * Clear all profile data.
   */
  function resetProfile() {
    const confirmed = window.confirm(
      'This will permanently clear your profile data. Are you sure?'
    );
    if (!confirmed) return;

    setName('');
    setEmail('');
    setAvatarBase64(null);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    setSavedState('saved');

    notifications.show({
      title: 'Profile cleared',
      message: 'Your profile data has been reset.',
      color: 'gray',
      icon: <IconRefresh size={16} />,
    });
  }

  const isModified = savedState !== 'saved';
  const initials = getInitials(name || 'You');

  return (
    <Stack gap="md" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div>
        <Group justify="space-between" wrap="wrap" mb="xs">
          <Text fw={700} size="xl">
            Your profile
          </Text>
          {isModified && (
            <Badge color="orange" size="sm" leftSection={<IconAlertTriangle size={12} />}>
              Unsaved changes
            </Badge>
          )}
        </Group>
        <Text size="sm" c="dimmed">
          Manage your personal information and preferences
        </Text>
      </div>

      <Tabs defaultValue="profile">
        {/* Profile tab */}
        <Tabs.List>
          <Tabs.Tab value="profile" leftSection={<IconUpload size={16} />}>
            Profile
          </Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<IconPalette size={16} />}>
            Settings
          </Tabs.Tab>
          <Tabs.Tab value="privacy" leftSection={<IconShield size={16} />}>
            Privacy
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile">
          <Stack gap="md" mt="md">
            {/* Avatar section */}
            <Card withBorder>
              <Stack gap="md">
                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Profile picture
                  </Text>
                  <Group gap="md" align="flex-start">
                    <UserAvatar
                      name={name || 'You'}
                      image={avatarBase64}
                      size="lg"
                    />
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <FileInput
                        accept="image/png,image/jpeg,image/webp"
                        icon={<IconUpload size={14} />}
                        label="Upload new picture"
                        placeholder="Choose image…"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                        clearable
                      />
                      <Text size="xs" c="dimmed">
                        PNG, JPG, or WebP • Max 2MB (compressed to ~100kb)
                      </Text>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <Progress value={uploadProgress} size="sm" animated />
                      )}
                    </Stack>
                  </Group>
                </div>
              </Stack>
            </Card>

            {/* Name and email section */}
            <Card withBorder>
              <Stack gap="md">
                <TextInput
                  label="Your name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.currentTarget.value);
                    setSavedState('unsaved');
                  }}
                  withAsterisk
                  size="md"
                  leftSection={<IconUpload size={16} />}
                />

                <TextInput
                  label="Email address"
                  placeholder="your.email@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.currentTarget.value);
                    setSavedState('unsaved');
                  }}
                  size="md"
                />

                <Group justify="flex-end" gap="sm">
                  <Button
                    variant="light"
                    color="gray"
                    onClick={resetProfile}
                  >
                    Clear data
                  </Button>
                  <Button
                    onClick={saveProfile}
                    loading={savedState === 'saving'}
                    color={isModified ? 'blue' : 'gray'}
                  >
                    {savedState === 'saving' ? 'Saving...' : 'Save profile'}
                  </Button>
                </Group>
              </Stack>
            </Card>

            {showSizeWarning && (
              <Alert icon={<IconAlertTriangle />} color="orange" title="Storage limit reached">
                Your avatar image is too large even after compression. Try a smaller or lower-resolution file.
              </Alert>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <Card withBorder mt="md">
            <Text size="sm" c="dimmed">Settings will be added in a future update.</Text>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="privacy">
          <Card withBorder mt="md">
            <Stack gap="sm">
              <div>
                <Text fw={500} size="sm" mb={4}>
                  📱 Local storage only
                </Text>
                <Text size="xs" c="dimmed">
                  Your profile is stored only in your browser. It does not sync to other devices.
                </Text>
              </div>
              <div>
                <Text fw={500} size="sm" mb={4}>
                  🔐 No cloud sync
                </Text>
                <Text size="xs" c="dimmed">
                  Your data is yours. Clearing browser data will remove your profile.
                </Text>
              </div>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}