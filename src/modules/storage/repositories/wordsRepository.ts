import { createId } from '@/modules/shared/utils/ids';
import { getDatabase } from '../db/database';
import type { SavedWord, TranslatedWord } from '../types/models';

export async function listSavedWords(bookId: string): Promise<SavedWord[]> {
  const database = await getDatabase();
  return database.getAllAsync<SavedWord>(
    `
      SELECT
        id,
        book_id as bookId,
        word,
        normalized_word as normalizedWord,
        translation,
        example_sentence as exampleSentence,
        created_at as createdAt
      FROM saved_words
      WHERE book_id = ?
      ORDER BY created_at DESC;
    `,
    [bookId],
  );
}

export async function listTranslatedWords(
  bookId: string,
): Promise<TranslatedWord[]> {
  const database = await getDatabase();
  return database.getAllAsync<TranslatedWord>(
    `
      SELECT
        id,
        book_id as bookId,
        word,
        normalized_word as normalizedWord,
        translation,
        context_sentence as contextSentence,
        translated_sentence as translatedSentence,
        last_translated_at as lastTranslatedAt,
        translate_count as translateCount
      FROM translated_words
      WHERE book_id = ?
      ORDER BY last_translated_at DESC;
    `,
    [bookId],
  );
}

export async function upsertTranslatedWord(input: {
  bookId: string;
  word: string;
  normalizedWord: string;
  translation: string;
  contextSentence: string;
  translatedSentence: string;
  timestamp: string;
}) {
  const database = await getDatabase();

  const existing = await database.getFirstAsync<{ id: string; translateCount: number }>(
    `
      SELECT id, translate_count as translateCount
      FROM translated_words
      WHERE book_id = ? AND normalized_word = ? AND context_sentence = ?
      LIMIT 1;
    `,
    [input.bookId, input.normalizedWord, input.contextSentence],
  );

  if (existing) {
    await database.runAsync(
      `
        UPDATE translated_words
        SET
          translation = ?,
          translated_sentence = ?,
          last_translated_at = ?,
          translate_count = ?
        WHERE id = ?;
      `,
      [
        input.translation,
        input.translatedSentence,
        input.timestamp,
        existing.translateCount + 1,
        existing.id,
      ],
    );

    return existing.id;
  }

  const id = createId('translated');
  await database.runAsync(
    `
      INSERT INTO translated_words (
        id, book_id, word, normalized_word, translation, context_sentence, translated_sentence, last_translated_at, translate_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1);
    `,
    [
      id,
      input.bookId,
      input.word,
      input.normalizedWord,
      input.translation,
      input.contextSentence,
      input.translatedSentence,
      input.timestamp,
    ],
  );

  return id;
}

export async function toggleSavedWord(input: {
  bookId: string;
  word: string;
  normalizedWord: string;
  translation: string;
  exampleSentence?: string;
}): Promise<'saved' | 'removed'> {
  const database = await getDatabase();

  const existing = await database.getFirstAsync<{ id: string }>(
    `
      SELECT id
      FROM saved_words
      WHERE book_id = ? AND normalized_word = ?
      LIMIT 1;
    `,
    [input.bookId, input.normalizedWord],
  );

  if (existing) {
    await database.runAsync('DELETE FROM saved_words WHERE id = ?;', [
      existing.id,
    ]);

    return 'removed';
  }

  await database.runAsync(
    `
      INSERT INTO saved_words (
        id, book_id, word, normalized_word, translation, example_sentence, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
    [
      createId('saved'),
      input.bookId,
      input.word,
      input.normalizedWord,
      input.translation,
      input.exampleSentence ?? null,
      new Date().toISOString(),
    ],
  );

  return 'saved';
}

export async function deleteSavedWord(savedWordId: string) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM saved_words WHERE id = ?;', [savedWordId]);
}
