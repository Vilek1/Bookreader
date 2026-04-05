import { Modal, Pressable, Text, View } from 'react-native';

import { useAppTheme } from '@/modules/theme/ThemeProvider';

type TranslationSheetProps = {
  visible: boolean;
  title: string;
  translation: string;
  context: string;
  translatedContext: string;
  saveLabel?: string;
  onClose: () => void;
  onSave?: () => void;
};

export function TranslationSheet({
  visible,
  title,
  translation,
  context,
  translatedContext,
  saveLabel = 'Save',
  onClose,
  onSave,
}: TranslationSheetProps) {
  const theme = useAppTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.28)',
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
          }}
        >
          <Text style={{ ...theme.typography.heading, color: theme.colors.textPrimary }}>
            {title}
          </Text>
          <Text style={{ ...theme.typography.title, color: theme.colors.primary }}>
            {translation}
          </Text>
          {context ? (
            <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>
              {context}
            </Text>
          ) : null}
          {translatedContext ? (
            <Text style={{ ...theme.typography.body, color: theme.colors.textPrimary }}>
              {translatedContext}
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                padding: theme.spacing.md,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.surfaceMuted,
              }}
            >
              <Text style={{ textAlign: 'center', color: theme.colors.textPrimary }}>
                Close
              </Text>
            </Pressable>
            {onSave ? (
              <Pressable
                onPress={onSave}
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.md,
                  backgroundColor: theme.colors.primary,
                }}
              >
                <Text style={{ textAlign: 'center', color: theme.colors.white, fontWeight: '700' }}>
                  {saveLabel}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}
