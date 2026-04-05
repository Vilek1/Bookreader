import { createId } from '@/modules/shared/utils/ids';
import { getDatabase } from '../db/database';

type CachedTranslation = {
  translatedText: string;
};

export async function getCachedTranslation(cacheKey: string) {
  const database = await getDatabase();
  return database.getFirstAsync<CachedTranslation>(
    `
      SELECT translated_text as translatedText
      FROM translation_cache
      WHERE cache_key = ?
      LIMIT 1;
    `,
    [cacheKey],
  );
}

export async function upsertCachedTranslation(input: {
  cacheKey: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  contextHash?: string | null;
  translatedText: string;
}) {
  const database = await getDatabase();
  const timestamp = new Date().toISOString();

  await database.runAsync(
    `
      INSERT INTO translation_cache (
        id, cache_key, source_text, source_language, target_language, context_hash, translated_text, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(cache_key) DO UPDATE SET
        translated_text = excluded.translated_text,
        updated_at = excluded.updated_at;
    `,
    [
      createId('cache'),
      input.cacheKey,
      input.sourceText,
      input.sourceLanguage,
      input.targetLanguage,
      input.contextHash ?? null,
      input.translatedText,
      timestamp,
      timestamp,
    ],
  );
}
