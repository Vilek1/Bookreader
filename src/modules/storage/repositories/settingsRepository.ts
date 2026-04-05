import { getDatabase } from '../db/database';
import type { AppSettings } from '../types/models';

export const defaultAppSettings: AppSettings = {
  themeMode: 'system',
  readerFontSize: 16,
  readerTextAlignment: 'left',
  appLanguage: 'en-US',
  translationLanguage: 'pl-PL',
  translationProvider: 'deepl_free',
};

export async function getAppSettings(): Promise<AppSettings> {
  const database = await getDatabase();
  await ensureAppSettingsColumns(database);

  const row = await database.getFirstAsync<AppSettings>(
    `
      SELECT
        theme_mode as themeMode,
        reader_font_size as readerFontSize,
        reader_text_alignment as readerTextAlignment,
        app_language as appLanguage,
        translation_language as translationLanguage,
        translation_provider as translationProvider
      FROM app_settings
      WHERE id = 1
      LIMIT 1;
    `,
  );

  return row ?? defaultAppSettings;
}

export async function saveAppSettings(settings: AppSettings) {
  const database = await getDatabase();
  await ensureAppSettingsColumns(database);

  await database.runAsync(
    `
      INSERT INTO app_settings (
        id,
        theme_mode,
        reader_font_size,
        reader_text_alignment,
        app_language,
        translation_language,
        translation_provider,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        theme_mode = excluded.theme_mode,
        reader_font_size = excluded.reader_font_size,
        reader_text_alignment = excluded.reader_text_alignment,
        app_language = excluded.app_language,
        translation_language = excluded.translation_language,
        translation_provider = excluded.translation_provider,
        updated_at = excluded.updated_at;
    `,
    [
      1,
      settings.themeMode,
      settings.readerFontSize,
      settings.readerTextAlignment,
      settings.appLanguage,
      settings.translationLanguage,
      settings.translationProvider,
      new Date().toISOString(),
    ],
  );
}

async function ensureAppSettingsColumns(
  database: Awaited<ReturnType<typeof getDatabase>>,
) {
  const tableInfo = await database.getAllAsync<{ name: string }>(
    'PRAGMA table_info(app_settings);',
  );
  const columnNames = new Set(tableInfo.map((column) => column.name));

  if (!columnNames.has('translation_provider')) {
    await database.execAsync(
      "ALTER TABLE app_settings ADD COLUMN translation_provider TEXT NOT NULL DEFAULT 'deepl_free';",
    );
  }
}
