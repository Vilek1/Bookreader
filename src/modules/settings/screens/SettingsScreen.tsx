import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Path, Rect, SvgXml } from 'react-native-svg';

import { RootStackParamList } from '@/app/navigation/types';
import { BottomBar } from '@/modules/library/components/BottomBar';
import { useAppSettings } from '@/modules/settings/AppSettingsProvider';
import { useAppTheme, useResolvedColorScheme } from '@/modules/theme/ThemeProvider';
import type {
  AppLanguage,
  ReaderTextAlignment,
  ThemeMode,
  TranslationLanguage,
  TranslationProvider,
} from '@/modules/storage/types/models';
import { type AppTheme } from '@/modules/theme/tokens/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

type TextAlignment = ReaderTextAlignment;
type ColorMode = ThemeMode;

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 24;
const SLIDER_THUMB_SIZE = 24;
const SLIDER_TRACK_HEIGHT = 8;
const SLIDER_CONTAINER_HEIGHT = 56;
const SLIDER_LABEL_TOP = 34;
const PREVIEW_TEXT =
  'Far far away, behind the word mountains, far from the countries of Vokalia...';

const appLanguageLabel: Record<AppLanguage, string> = {
  'en-US': 'English (US)',
};

const translationLanguageLabel: Record<TranslationLanguage, string> = {
  'pl-PL': 'Polish (PL)',
  'ru-RU': 'Russian (RU)',
  'uk-UA': 'Ukrainian (UK)',
};

const translationProviderLabel: Record<TranslationProvider, string> = {
  deepl_free: 'DeepL Free',
  mock: 'Mock',
};

const textAlignmentOptions: { value: TextAlignment; label: string }[] = [
  { value: 'left', label: 'left' },
  { value: 'center', label: 'center' },
  { value: 'right', label: 'right' },
  { value: 'justify', label: 'justify' },
];

const colorModeOptions: { value: ColorMode; label: string }[] = [
  { value: 'system', label: 'System preference' },
  { value: 'light', label: 'Light mode' },
  { value: 'dark', label: 'Dark mode' },
];

const SYSTEM_MODE_SVG = String.raw`<svg width="200" height="132" viewBox="0 0 200 132" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_14976_3757)">
<path d="M0 10C0 4.47715 4.47715 0 10 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H10C4.47716 132 0 127.523 0 122V10Z" fill="#F5F5F5"/>
<g clip-path="url(#clip1_14976_3757)">
<path d="M0 10C0 4.47715 4.47715 0 10 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H10C4.47716 132 0 127.523 0 122V10Z" fill="#F5F5F5"/>
<rect width="117.5" height="1.25001" transform="translate(13.125 117.5) rotate(-90)" fill="#E9EAEB"/>
<rect width="200" height="1.25" transform="translate(0 13.125)" fill="#E9EAEB"/>
<rect width="117.5" height="1.25001" transform="translate(185.625 117.5) rotate(-90)" fill="#E9EAEB"/>
<g clip-path="url(#clip2_14976_3757)">
<rect x="13" y="13" width="175" height="129" rx="5" fill="white"/>
<rect x="138.625" y="29.875" width="20" height="6.875" rx="1.875" fill="#F5F5F5"/>
<rect x="161.75" y="29.875" width="20" height="6.875" rx="1.875" fill="#7F56D9"/>
<mask id="path-8-inside-1_14976_3757" fill="white"><path d="M13.5 23.5H186.5V143.5H13.5V23.5Z"/></mask>
<path d="M186.5 23.5H186.188V143.5H186.5H186.812V23.5H186.5Z" fill="#E9EAEB" mask="url(#path-8-inside-1_14976_3757)"/>
<rect x="26.625" y="30.375" width="13.75" height="3.75" rx="1.25" fill="#7F56D9"/>
<rect x="19.75" y="29.75" width="5" height="5" rx="2.5" fill="#7F56D9"/>
<rect x="19.5" y="42.5" width="74" height="5" rx="1.25" fill="#7F56D9"/>
<rect x="19.5" y="51.25" width="74" height="5" rx="1.25" fill="#F5F5F5"/>
<rect x="19.5" y="60" width="74" height="5" rx="1.25" fill="#F5F5F5"/>
<rect x="19.5" y="68.75" width="74" height="5" rx="1.25" fill="#F5F5F5"/>
<rect x="19.5" y="77.5" width="74" height="5" rx="1.25" fill="#F5F5F5"/>
<rect x="19.5" y="86.25" width="74" height="5" rx="1.25" fill="#F5F5F5"/>
</g>
<rect x="13.3125" y="13.3125" width="174.375" height="128.375" rx="4.6875" stroke="#D5D7DA" stroke-width="0.625"/>
</g>
<path d="M10 0.5H190C195.247 0.5 199.5 4.7533 199.5 10V122C199.5 127.247 195.247 131.5 190 131.5H10C4.7533 131.5 0.5 127.247 0.5 122V10C0.5 4.7533 4.7533 0.5 10 0.5Z" stroke="#D5D7DA"/>
<g clip-path="url(#clip3_14976_3757)">
<mask id="path-18-inside-2_14976_3757" fill="white"><path d="M100 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H100V0Z"/></mask>
<path d="M100 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H100V0Z" fill="#22262F"/>
<rect width="200" height="1.25" transform="translate(0 13.125)" fill="#373A41"/>
<rect width="117.5" height="1.25001" transform="translate(185.625 117.5) rotate(-90)" fill="#373A41"/>
<rect x="13.3125" y="13.3125" width="174.375" height="129.375" rx="4.6875" fill="#0C0E12"/>
<rect x="13.3125" y="13.3125" width="174.375" height="129.375" rx="4.6875" stroke="#373A41" stroke-width="0.625"/>
<rect x="106.5" y="42.5" width="74" height="5" rx="1.25" fill="#7F56D9"/>
<rect x="106.5" y="51.25" width="74" height="5" rx="1.25" fill="#22262F"/>
<rect x="106.5" y="60" width="74" height="5" rx="1.25" fill="#22262F"/>
<rect x="106.5" y="68.75" width="74" height="5" rx="1.25" fill="#22262F"/>
<rect x="106.5" y="77.5" width="74" height="5" rx="1.25" fill="#22262F"/>
<rect x="106.5" y="86.25" width="74" height="5" rx="1.25" fill="#22262F"/>
</g>
<path d="M100 -1H190C196.075 -1 201 3.92487 201 10H199C199 5.02944 194.971 1 190 1H100V-1ZM201 122C201 128.075 196.075 133 190 133H100V131H190C194.971 131 199 126.971 199 122H201ZM199 122M100 132V0V132M190 -1C196.075 -1 201 3.92487 201 10V122C201 128.075 196.075 133 190 133V131C194.971 131 199 126.971 199 122V10C199 5.02944 194.971 1 190 1V-1Z" fill="#373A41" mask="url(#path-18-inside-2_14976_3757)"/>
</g>
<defs><clipPath id="clip0_14976_3757"><path d="M0 10C0 4.47715 4.47715 0 10 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H10C4.47716 132 0 127.523 0 122V10Z" fill="white"/></clipPath><clipPath id="clip1_14976_3757"><path d="M0 10C0 4.47715 4.47715 0 10 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H10C4.47716 132 0 127.523 0 122V10Z" fill="white"/></clipPath><clipPath id="clip2_14976_3757"><rect x="13" y="13" width="175" height="129" rx="5" fill="white"/></clipPath><clipPath id="clip3_14976_3757"><path d="M100 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H100V0Z" fill="white"/></clipPath></defs>
</svg>`;

const LIGHT_MODE_SVG = String.raw`<svg width="200" height="132" viewBox="0 0 200 132" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_14976_3805)"><path d="M0 10C0 4.47715 4.47715 0 10 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H10C4.47716 132 0 127.523 0 122V10Z" fill="#F5F5F5"/><g clip-path="url(#clip1_14976_3805)"><path d="M0 10C0 4.47715 4.47715 0 10 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H10C4.47716 132 0 127.523 0 122V10Z" fill="#F5F5F5"/><rect width="117.5" height="1.25001" transform="translate(13.125 117.5) rotate(-90)" fill="#E9EAEB"/><rect width="200" height="1.25" transform="translate(0 13.125)" fill="#E9EAEB"/><rect width="117.5" height="1.25001" transform="translate(185.625 117.5) rotate(-90)" fill="#E9EAEB"/><g clip-path="url(#clip2_14976_3805)"><rect x="13" y="13" width="175" height="129" rx="5" fill="white"/><rect x="138.625" y="29.875" width="20" height="6.875" rx="1.875" fill="#F5F5F5"/><rect x="161.75" y="29.875" width="20" height="6.875" rx="1.875" fill="#7F56D9"/><mask id="path-8-inside-1_14976_3805" fill="white"><path d="M13.5 23.5H186.5V143.5H13.5V23.5Z"/></mask><path d="M186.5 23.5H186.188V143.5H186.5H186.812V23.5H186.5Z" fill="#E9EAEB" mask="url(#path-8-inside-1_14976_3805)"/><rect x="26.625" y="30.375" width="13.75" height="3.75" rx="1.25" fill="#7F56D9"/><rect x="19.75" y="29.75" width="5" height="5" rx="2.5" fill="#7F56D9"/><rect x="19.5" y="42.5" width="74" height="5" rx="1.25" fill="#7F56D9"/><rect x="19.5" y="51.25" width="74" height="5" rx="1.25" fill="#F5F5F5"/><rect x="19.5" y="60" width="74" height="5" rx="1.25" fill="#F5F5F5"/><rect x="19.5" y="68.75" width="74" height="5" rx="1.25" fill="#F5F5F5"/><rect x="19.5" y="77.5" width="74" height="5" rx="1.25" fill="#F5F5F5"/><rect x="19.5" y="86.25" width="74" height="5" rx="1.25" fill="#F5F5F5"/></g><rect x="13.3125" y="13.3125" width="174.375" height="128.375" rx="4.6875" stroke="#D5D7DA" stroke-width="0.625"/></g><path d="M10 0.5H190C195.247 0.5 199.5 4.7533 199.5 10V122C199.5 127.247 195.247 131.5 190 131.5H10C4.7533 131.5 0.5 127.247 0.5 122V10C0.5 4.7533 4.7533 0.5 10 0.5Z" stroke="#D5D7DA"/><g clip-path="url(#clip3_14976_3805)"><mask id="path-18-inside-2_14976_3805" fill="white"><path d="M100 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H100V0Z"/></mask><path d="M100 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H100V0Z" fill="#F5F5F5"/><rect width="200" height="1.25" transform="translate(0 13.125)" fill="#E9EAEB"/><rect width="117.5" height="1.25001" transform="translate(185.625 117.5) rotate(-90)" fill="#E9EAEB"/><rect x="13.3125" y="13.3125" width="174.375" height="129.375" rx="4.6875" fill="white"/><rect x="13.3125" y="13.3125" width="174.375" height="129.375" rx="4.6875" stroke="#D5D7DA" stroke-width="0.625"/><rect x="106.5" y="42.5" width="74" height="5" rx="1.25" fill="#7F56D9"/><rect x="106.5" y="51.25" width="74" height="5" rx="1.25" fill="#F5F5F5"/><rect x="106.5" y="60" width="74" height="5" rx="1.25" fill="#F5F5F5"/><rect x="106.5" y="68.75" width="74" height="5" rx="1.25" fill="#F5F5F5"/><rect x="106.5" y="77.5" width="74" height="5" rx="1.25" fill="#F5F5F5"/><rect x="106.5" y="86.25" width="74" height="5" rx="1.25" fill="#F5F5F5"/></g><path d="M100 -1H190C196.075 -1 201 3.92487 201 10H199C199 5.02944 194.971 1 190 1H100V-1ZM201 122C201 128.075 196.075 133 190 133H100V131H190C194.971 131 199 126.971 199 122H201ZM199 122M100 132V0V132M190 -1C196.075 -1 201 3.92487 201 10V122C201 128.075 196.075 133 190 133V131C194.971 131 199 126.971 199 122V10C199 5.02944 194.971 1 190 1V-1Z" fill="#D5D7DA" mask="url(#path-18-inside-2_14976_3805)"/></g><defs><clipPath id="clip0_14976_3805"><path d="M0 10C0 4.47715 4.47715 0 10 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H10C4.47716 132 0 127.523 0 122V10Z" fill="white"/></clipPath><clipPath id="clip1_14976_3805"><path d="M0 10C0 4.47715 4.47715 0 10 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H10C4.47716 132 0 127.523 0 122V10Z" fill="white"/></clipPath><clipPath id="clip2_14976_3805"><rect x="13" y="13" width="175" height="129" rx="5" fill="white"/></clipPath><clipPath id="clip3_14976_3805"><path d="M100 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H100V0Z" fill="white"/></clipPath></defs></svg>`;

const DARK_MODE_SVG = String.raw`<svg width="200" height="132" viewBox="0 0 200 132" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_14976_3853)"><path d="M0 10C0 4.47715 4.47715 0 10 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H10C4.47716 132 0 127.523 0 122V10Z" fill="#F5F5F5"/><g clip-path="url(#clip1_14976_3853)"><path d="M0 10C0 4.47715 4.47715 0 10 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H10C4.47716 132 0 127.523 0 122V10Z" fill="#22262F"/><rect width="117.5" height="1.25001" transform="translate(13.125 117.5) rotate(-90)" fill="#373A41"/><rect width="200" height="1.25" transform="translate(0 13.125)" fill="#373A41"/><rect width="117.5" height="1.25001" transform="translate(185.625 117.5) rotate(-90)" fill="#373A41"/><g clip-path="url(#clip2_14976_3853)"><rect x="13" y="13" width="175" height="129" rx="5" fill="#0C0E12"/><rect x="138.625" y="29.875" width="20" height="6.875" rx="1.875" fill="#22262F"/><rect x="161.75" y="29.875" width="20" height="6.875" rx="1.875" fill="#7F56D9"/><mask id="path-8-inside-1_14976_3853" fill="white"><path d="M13.5 23.5H186.5V143.5H13.5V23.5Z"/></mask><path d="M186.5 23.5H186.188V143.5H186.5H186.812V23.5H186.5Z" fill="#22262F" mask="url(#path-8-inside-1_14976_3853)"/><rect x="26.625" y="30.375" width="13.75" height="3.75" rx="1.25" fill="#7F56D9"/><rect x="19.75" y="29.75" width="5" height="5" rx="2.5" fill="#7F56D9"/><rect x="19.5" y="42.5" width="74" height="5" rx="1.25" fill="#7F56D9"/><rect x="19.5" y="51.25" width="74" height="5" rx="1.25" fill="#22262F"/><rect x="19.5" y="60" width="74" height="5" rx="1.25" fill="#22262F"/><rect x="19.5" y="68.75" width="74" height="5" rx="1.25" fill="#22262F"/><rect x="19.5" y="77.5" width="74" height="5" rx="1.25" fill="#22262F"/><rect x="19.5" y="86.25" width="74" height="5" rx="1.25" fill="#22262F"/></g><rect x="13.3125" y="13.3125" width="174.375" height="128.375" rx="4.6875" stroke="#373A41" stroke-width="0.625"/></g><path d="M10 0.5H190C195.247 0.5 199.5 4.7533 199.5 10V122C199.5 127.247 195.247 131.5 190 131.5H10C4.7533 131.5 0.5 127.247 0.5 122V10C0.5 4.7533 4.7533 0.5 10 0.5Z" stroke="#373A41"/><g clip-path="url(#clip3_14976_3853)"><mask id="path-18-inside-2_14976_3853" fill="white"><path d="M100 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H100V0Z"/></mask><path d="M100 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H100V0Z" fill="#22262F"/><rect width="200" height="1.25" transform="translate(0 13.125)" fill="#373A41"/><rect width="117.5" height="1.25001" transform="translate(185.625 117.5) rotate(-90)" fill="#373A41"/><rect x="13.3125" y="13.3125" width="174.375" height="129.375" rx="4.6875" fill="#0C0E12"/><rect x="13.3125" y="13.3125" width="174.375" height="129.375" rx="4.6875" stroke="#373A41" stroke-width="0.625"/><rect x="106.5" y="42.5" width="74" height="5" rx="1.25" fill="#7F56D9"/><rect x="106.5" y="51.25" width="74" height="5" rx="1.25" fill="#22262F"/><rect x="106.5" y="60" width="74" height="5" rx="1.25" fill="#22262F"/><rect x="106.5" y="68.75" width="74" height="5" rx="1.25" fill="#22262F"/><rect x="106.5" y="77.5" width="74" height="5" rx="1.25" fill="#22262F"/><rect x="106.5" y="86.25" width="74" height="5" rx="1.25" fill="#22262F"/></g><path d="M100 -1H190C196.075 -1 201 3.92487 201 10H199C199 5.02944 194.971 1 190 1H100V-1ZM201 122C201 128.075 196.075 133 190 133H100V131H190C194.971 131 199 126.971 199 122H201ZM199 122M100 132V0V132M190 -1C196.075 -1 201 3.92487 201 10V122C201 128.075 196.075 133 190 133V131C194.971 131 199 126.971 199 122V10C199 5.02944 194.971 1 190 1V-1Z" fill="#373A41" mask="url(#path-18-inside-2_14976_3853)"/></g><defs><clipPath id="clip0_14976_3853"><path d="M0 10C0 4.47715 4.47715 0 10 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H10C4.47716 132 0 127.523 0 122V10Z" fill="white"/></clipPath><clipPath id="clip1_14976_3853"><path d="M0 10C0 4.47715 4.47715 0 10 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H10C4.47716 132 0 127.523 0 122V10Z" fill="white"/></clipPath><clipPath id="clip2_14976_3853"><rect x="13" y="13" width="175" height="129" rx="5" fill="white"/></clipPath><clipPath id="clip3_14976_3853"><path d="M100 0H190C195.523 0 200 4.47715 200 10V122C200 127.523 195.523 132 190 132H100V0Z" fill="white"/></clipPath></defs></svg>`;

export function SettingsScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const resolvedColorScheme = useResolvedColorScheme();
  const {
    settings: {
      appLanguage,
      translationLanguage,
      translationProvider,
      readerFontSize,
      readerTextAlignment,
      themeMode,
    },
    setReaderFontSize,
    setReaderTextAlignment,
    setThemeMode,
    setTranslationLanguage,
    setTranslationProvider,
  } = useAppSettings();
  const dividerColor = theme.colors.borderSubtle;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <StatusBar style={resolvedColorScheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Toolbar theme={theme} />

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 12 }}
        >
          <LanguageSection
            theme={theme}
            dividerColor={dividerColor}
            appLanguage={appLanguage}
            translationLanguage={translationLanguage}
            translationProvider={translationProvider}
            onTranslationLanguagePress={() =>
              setTranslationLanguage(getNextTranslationLanguage(translationLanguage))
            }
            onTranslationProviderPress={() =>
              setTranslationProvider(getNextTranslationProvider(translationProvider))
            }
          />

          <FontSizeSection
            theme={theme}
            dividerColor={dividerColor}
            fontSize={readerFontSize}
            textAlignment={readerTextAlignment}
            onFontSizeChange={setReaderFontSize}
          />

          <TextAlignmentSection
            theme={theme}
            dividerColor={dividerColor}
            value={readerTextAlignment}
            onChange={setReaderTextAlignment}
          />

          <ColorModeSection
            theme={theme}
            value={themeMode}
            onChange={setThemeMode}
          />
        </ScrollView>

        <BottomBar
          activeTab="Settings"
          onLibraryPress={() => navigation.replace('Library')}
          onBookPress={() => navigation.replace('BookHome')}
          onSettingsPress={() => {}}
        />
      </View>
    </SafeAreaView>
  );
}

function Toolbar({ theme }: { theme: AppTheme }) {
  return (
    <View
      style={{
        height: 56,
        paddingHorizontal: 16,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View style={{ width: 44, height: 44 }} />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text
          style={{
            ...theme.typography.titleMedium,
            color: theme.colors.textPrimary,
          }}
        >
          Settings
        </Text>
      </View>
      <View style={{ width: 44, height: 44 }} />
    </View>
  );
}

function LanguageSection({
  theme,
  dividerColor,
  appLanguage,
  translationLanguage,
  translationProvider,
  onTranslationLanguagePress,
  onTranslationProviderPress,
}: {
  theme: AppTheme;
  dividerColor: string;
  appLanguage: AppLanguage;
  translationLanguage: TranslationLanguage;
  translationProvider: TranslationProvider;
  onTranslationLanguagePress: () => void;
  onTranslationProviderPress: () => void;
}) {
  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: dividerColor,
        paddingHorizontal: 16,
        paddingVertical: 24,
      }}
    >
      <View style={{ gap: 20 }}>
        <View style={{ gap: 8 }}>
          <SectionTitle theme={theme}>App Language</SectionTitle>
          <LanguageSelect
            theme={theme}
            flag={<UsFlagIcon size={20} />}
            value={appLanguageLabel[appLanguage]}
          />
        </View>

        <View style={{ gap: 8 }}>
          <SectionTitle theme={theme}>Translation Language</SectionTitle>
          <LanguageSelect
            theme={theme}
            flag={getTranslationLanguageFlag(translationLanguage)}
            value={translationLanguageLabel[translationLanguage]}
            onPress={onTranslationLanguagePress}
          />
        </View>

        <View style={{ gap: 8 }}>
          <SectionTitle theme={theme}>Translation Service</SectionTitle>
          <LanguageSelect
            theme={theme}
            flag={<TranslationServiceIcon size={20} color={theme.colors.textPrimary} />}
            value={translationProviderLabel[translationProvider]}
            onPress={onTranslationProviderPress}
          />
        </View>
      </View>
    </View>
  );
}

function FontSizeSection({
  theme,
  dividerColor,
  fontSize,
  textAlignment,
  onFontSizeChange,
}: {
  theme: AppTheme;
  dividerColor: string;
  fontSize: number;
  textAlignment: TextAlignment;
  onFontSizeChange: (value: number) => void;
}) {
  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: dividerColor,
        paddingHorizontal: 16,
        paddingVertical: 24,
        gap: 20,
      }}
    >
      <View style={{ gap: 2 }}>
        <SectionTitle theme={theme}>Font size</SectionTitle>
        <SectionDescription theme={theme}>
          Choose the font size that works best for you
        </SectionDescription>
      </View>

      <View
        style={{
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.borderSubtle,
          padding: 16,
        }}
      >
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize,
            lineHeight: fontSize * 1.5,
            textAlign: textAlignment,
          }}
        >
          {PREVIEW_TEXT}
        </Text>
      </View>

      <FontSizeSlider
        theme={theme}
        value={fontSize}
        onChange={onFontSizeChange}
      />
    </View>
  );
}

function TextAlignmentSection({
  theme,
  dividerColor,
  value,
  onChange,
}: {
  theme: AppTheme;
  dividerColor: string;
  value: TextAlignment;
  onChange: (value: TextAlignment) => void;
}) {
  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: dividerColor,
        paddingHorizontal: 16,
        paddingVertical: 24,
        gap: 20,
      }}
    >
      <View style={{ gap: 2 }}>
        <SectionTitle theme={theme}>Text Alignment</SectionTitle>
        <SectionDescription theme={theme}>
          Select your preferred text alignment
        </SectionDescription>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 2,
        }}
      >
        {textAlignmentOptions.map((option) => {
          const isActive = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              onPress={() => onChange(option.value)}
              style={{
                width: 56,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlignmentIcon
                alignment={option.value}
                color={isActive ? theme.colors.primary : theme.colors.textSecondary}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ColorModeSection({
  theme,
  value,
  onChange,
}: {
  theme: AppTheme;
  value: ColorMode;
  onChange: (value: ColorMode) => void;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 24,
        gap: 20,
      }}
    >
      <View style={{ gap: 2 }}>
        <SectionTitle theme={theme}>Color mode</SectionTitle>
        <SectionDescription theme={theme}>
          Select light, dark, or follow system settings
        </SectionDescription>
      </View>

      <ScrollView
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 20, paddingRight: 16 }}
      >
        {colorModeOptions.map((option) => (
          <ModeCard
            key={option.value}
            theme={theme}
            mode={option.value}
            label={option.label}
            isSelected={value === option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function FontSizeSlider({
  theme,
  value,
  onChange,
}: {
  theme: AppTheme;
  value: number;
  onChange: (value: number) => void;
}) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const range = MAX_FONT_SIZE - MIN_FONT_SIZE;
  const normalized = (value - MIN_FONT_SIZE) / range;
  const maxTravel = Math.max(sliderWidth - SLIDER_THUMB_SIZE, 0);
  const trackLeft = SLIDER_THUMB_SIZE / 2;
  const thumbCenterX = trackLeft + maxTravel * normalized;
  const animatedThumbLeft = useRef(new Animated.Value(0)).current;
  const sliderWidthRef = useRef(sliderWidth);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const hasMeasuredRef = useRef(false);

  sliderWidthRef.current = sliderWidth;
  valueRef.current = value;
  onChangeRef.current = onChange;

  useEffect(() => {
    const nextLeft = thumbCenterX - SLIDER_THUMB_SIZE / 2;

    if (sliderWidth <= SLIDER_THUMB_SIZE) {
      return;
    }

    if (!hasMeasuredRef.current) {
      animatedThumbLeft.setValue(nextLeft);
      hasMeasuredRef.current = true;
      return;
    }

    Animated.spring(animatedThumbLeft, {
      toValue: nextLeft,
      useNativeDriver: true,
      overshootClamping: true,
      speed: 24,
      bounciness: 0,
    }).start();
  }, [animatedThumbLeft, sliderWidth, thumbCenterX]);

  const updateValue = useCallback((locationX: number) => {
    const currentSliderWidth = sliderWidthRef.current;

    if (currentSliderWidth <= SLIDER_THUMB_SIZE) {
      return;
    }

    const currentTrackLeft = SLIDER_THUMB_SIZE / 2;
    const currentMaxTravel = Math.max(currentSliderWidth - SLIDER_THUMB_SIZE, 0);
    const clamped = Math.min(
      Math.max(locationX, currentTrackLeft),
      currentSliderWidth - currentTrackLeft,
    );
    const ratio = (clamped - currentTrackLeft) / currentMaxTravel;
    const nextValue = Math.round(MIN_FONT_SIZE + ratio * range);

    if (nextValue !== valueRef.current) {
      valueRef.current = nextValue;
      onChangeRef.current(nextValue);
    }
  }, [range]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          updateValue(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => {
          updateValue(event.nativeEvent.locationX);
        },
      }),
    [updateValue],
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      <View style={{ paddingTop: 2 }}>
        <TextSizeSmallIcon color={theme.colors.textSecondary} />
      </View>

      <View
        onLayout={(event) => {
          const nextWidth = Math.round(event.nativeEvent.layout.width);

          setSliderWidth((currentWidth) =>
            currentWidth === nextWidth ? currentWidth : nextWidth,
          );
        }}
        {...panResponder.panHandlers}
        style={{
          flex: 1,
          height: SLIDER_CONTAINER_HEIGHT,
          position: 'relative',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: trackLeft,
            right: trackLeft,
            top: 8,
            height: SLIDER_TRACK_HEIGHT,
            borderRadius: 999,
            backgroundColor: theme.colors.border,
          }}
        />

        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: SLIDER_THUMB_SIZE,
            height: SLIDER_CONTAINER_HEIGHT,
            transform: [{ translateX: animatedThumbLeft }],
          }}
        >
          <SliderThumb theme={theme} left={0} />
          <Text
            style={{
              position: 'absolute',
              top: SLIDER_LABEL_TOP,
              left: -12,
              width: 48,
              textAlign: 'center',
              color: theme.colors.textPrimary,
              ...theme.typography.bodyMedium,
            }}
          >
            {value}
          </Text>
        </Animated.View>
      </View>

      <View style={{ paddingTop: 2 }}>
        <TextSizeLargeIcon color={theme.colors.textSecondary} />
      </View>
    </View>
  );
}

function SliderThumb({
  theme,
  left,
}: {
  theme: AppTheme;
  left: number;
}) {
  return (
    <View
      style={{
        position: 'absolute',
        left,
        top: 0,
        width: SLIDER_THUMB_SIZE,
        height: SLIDER_THUMB_SIZE,
        borderRadius: SLIDER_THUMB_SIZE / 2,
        borderWidth: 2,
        borderColor: theme.colors.primaryStrong,
        backgroundColor: theme.colors.white,
        shadowColor: theme.colors.overlay,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      }}
    />
  );
}

function LanguageSelect({
  theme,
  flag,
  value,
  onPress,
}: {
  theme: AppTheme;
  flag: ReactNode;
  value: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        shadowColor: theme.colors.overlay,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
        {flag}
        <Text
          style={{
            ...theme.typography.bodyMedium,
            color: theme.colors.textPrimary,
            flexShrink: 1,
          }}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>

      <ChevronDownIcon color={theme.colors.textTertiary} />
    </Pressable>
  );
}

function getNextTranslationLanguage(
  currentLanguage: TranslationLanguage,
): TranslationLanguage {
  const order: TranslationLanguage[] = ['pl-PL', 'ru-RU', 'uk-UA'];
  const currentIndex = order.indexOf(currentLanguage);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % order.length;
  return order[nextIndex];
}

function getNextTranslationProvider(
  currentProvider: TranslationProvider,
): TranslationProvider {
  const order: TranslationProvider[] = ['deepl_free', 'mock'];
  const currentIndex = order.indexOf(currentProvider);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % order.length;
  return order[nextIndex];
}

function getTranslationLanguageFlag(language: TranslationLanguage) {
  if (language === 'ru-RU') {
    return <RussiaFlagIcon size={20} />;
  }

  if (language === 'uk-UA') {
    return <UkraineFlagIcon size={20} />;
  }

  return <PolandFlagIcon size={20} />;
}

function ModeCard({
  theme,
  mode,
  label,
  isSelected,
  onPress,
}: {
  theme: AppTheme;
  mode: ColorMode;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ width: 200 }}>
      <View style={{ gap: 12 }}>
        <ModeCardFrame theme={theme} isSelected={isSelected}>
          <ModePreview mode={mode} />
        </ModeCardFrame>

        <Text
          style={{
            ...theme.typography.bodySmallMedium,
            color: theme.colors.textPrimary,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function ModeCardFrame({
  theme,
  isSelected,
  children,
}: {
  theme: AppTheme;
  isSelected: boolean;
  children: ReactNode;
}) {
  if (!isSelected) {
    return <View style={{ width: 200, height: 132 }}>{children}</View>;
  }

  return (
    <View
      style={{
        width: 200,
        height: 132,
        borderRadius: 14,
        padding: 4,
        backgroundColor: theme.colors.primary,
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: 12,
          padding: 2,
          backgroundColor: theme.colors.background,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function ModePreview({
  mode,
}: {
  mode: ColorMode;
}) {
  const xml =
    mode === 'system'
      ? SYSTEM_MODE_SVG
      : mode === 'light'
        ? LIGHT_MODE_SVG
        : DARK_MODE_SVG;

  return (
    <View style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 10 }}>
      <SvgXml xml={xml} width="100%" height="100%" />
    </View>
  );
}

function SectionTitle({
  theme,
  children,
}: {
  theme: AppTheme;
  children: ReactNode;
}) {
  return (
    <Text
      style={{
        ...theme.typography.bodySmallMedium,
        color: theme.colors.textSecondary,
      }}
    >
      {children}
    </Text>
  );
}

function SectionDescription({
  theme,
  children,
}: {
  theme: AppTheme;
  children: React.ReactNode;
}) {
  return (
    <Text
      style={{
        ...theme.typography.bodySmall,
        color: theme.colors.textTertiary,
      }}
    >
      {children}
    </Text>
  );
}

function AlignmentIcon({
  alignment,
  color,
}: {
  alignment: TextAlignment;
  color: string;
}) {
  const y = [4, 14, 24, 34];
  const widths =
    alignment === 'left'
      ? [36, 26, 42, 30]
      : alignment === 'center'
        ? [36, 28, 36, 24]
        : alignment === 'right'
          ? [36, 30, 36, 30]
          : [36, 36, 36, 36];

  return (
    <Svg width={42} height={40} viewBox="0 0 42 40" fill="none">
      {y.map((lineY, index) => {
        const width = widths[index];
        const x =
          alignment === 'left'
            ? 0
            : alignment === 'center'
              ? (42 - width) / 2
              : 42 - width;

        return (
          <Rect
            key={`${alignment}-${lineY}`}
            x={x}
            y={lineY}
            width={width}
            height={5}
            rx={2.5}
            fill={color}
          />
        );
      })}
    </Svg>
  );
}

function ChevronDownIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d="M4 6L8 10L12 6"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function UsFlagIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx={10} cy={10} r={10} fill="#F5F5F5" />
      <Path d="M0 10H20V12.5H0V10ZM0 5H20V7.5H0V5ZM0 15H20V17.5H0V15Z" fill="#D92D20" />
      <Path d="M0 2.5H20V4.5H0V2.5ZM0 7.5H20V9.5H0V7.5ZM0 12.5H20V14.5H0V12.5Z" fill="#D92D20" opacity={0.8} />
      <Rect x={0} y={0} width={9} height={9.5} rx={1} fill="#175CD3" />
      <Circle cx={2.2} cy={2.2} r={0.65} fill="white" />
      <Circle cx={4.5} cy={2.2} r={0.65} fill="white" />
      <Circle cx={6.8} cy={2.2} r={0.65} fill="white" />
      <Circle cx={3.35} cy={4.45} r={0.65} fill="white" />
      <Circle cx={5.65} cy={4.45} r={0.65} fill="white" />
      <Circle cx={2.2} cy={6.7} r={0.65} fill="white" />
      <Circle cx={4.5} cy={6.7} r={0.65} fill="white" />
      <Circle cx={6.8} cy={6.7} r={0.65} fill="white" />
    </Svg>
  );
}

function PolandFlagIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx={10} cy={10} r={10} fill="#F5F5F5" />
      <Path d="M0 10H20C20 15.523 15.523 20 10 20C4.477 20 0 15.523 0 10Z" fill="#D90429" />
    </Svg>
  );
}

function RussiaFlagIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx={10} cy={10} r={10} fill="#F5F5F5" />
      <Path d="M0 6.8H20V13.2H0V6.8Z" fill="#0A4EC2" />
      <Path d="M0 13.2H20C20 16.97 16.97 20 13.2 20H6.8C3.03 20 0 16.97 0 13.2Z" fill="#D90F2E" />
    </Svg>
  );
}

function UkraineFlagIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx={10} cy={10} r={10} fill="#1570EF" />
      <Path d="M0 10H20C20 15.523 15.523 20 10 20C4.477 20 0 15.523 0 10Z" fill="#FEC84B" />
    </Svg>
  );
}

function TranslationServiceIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx={10} cy={10} r={10} fill="rgba(21, 112, 239, 0.12)" />
      <Path
        d="M6 14.5L8.2 9M8.2 9L10.5 14.5M8.2 9H11.8M14 6.5V13.5M12 8H16"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TextSizeSmallIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 4V20M21 4V20M8 17L12 7L16 17M9.5 13.5H14.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TextSizeLargeIcon({ color }: { color: string }) {
  return (
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <Path
        d="M4 4V32M32 4V32M12 26L18 10L24 26M14.2 20H21.8"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
