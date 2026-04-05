import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LibraryScreen } from '@/modules/library/screens/LibraryScreen';
import { BookDetailsScreen } from '@/modules/book/screens/BookDetailsScreen';
import { BookHomeScreen } from '@/modules/book/screens/BookHomeScreen';
import { ChaptersScreen } from '@/modules/book/screens/ChaptersScreen';
import { ReaderScreen } from '@/modules/reader/screens/ReaderScreen';
import { WordsScreen } from '@/modules/words/screens/WordsScreen';
import { SettingsScreen } from '@/modules/settings/screens/SettingsScreen';
import { useAppTheme } from '@/modules/theme/ThemeProvider';

import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useAppTheme();
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      primary: theme.colors.primary,
      border: theme.colors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="BookHome"
        screenOptions={{
          animation: 'fade',
          animationDuration: 180,
          animationTypeForReplace: 'pop',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.textPrimary,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen
          name="BookHome"
          component={BookHomeScreen}
          options={{ title: 'Book', headerShown: false }}
        />
        <Stack.Screen
          name="Library"
          component={LibraryScreen}
          options={{ title: 'Library', headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings', headerShown: false }}
        />
        <Stack.Screen
          name="BookDetails"
          component={BookDetailsScreen}
          options={{ title: 'Book', headerShown: false }}
        />
        <Stack.Screen
          name="Reader"
          component={ReaderScreen}
          options={{ title: 'Reader', headerShown: false }}
        />
        <Stack.Screen
          name="Chapters"
          component={ChaptersScreen}
          options={{ title: 'Chapters', headerShown: false }}
        />
        <Stack.Screen
          name="Words"
          component={WordsScreen}
          options={{ title: 'Book words', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
