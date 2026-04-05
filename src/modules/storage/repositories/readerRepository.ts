import { getDatabase } from '../db/database';
import type { ReadingPosition } from '../types/models';

export async function getReadingPosition(
  bookId: string,
): Promise<ReadingPosition | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{
    bookId: string;
    chapterId: string;
    paragraphIndex: number;
    updatedAt: string;
  }>(
    `
      SELECT
        book_id as bookId,
        chapter_id as chapterId,
        paragraph_index as paragraphIndex,
        updated_at as updatedAt
      FROM reading_positions
      WHERE book_id = ?
      LIMIT 1;
    `,
    [bookId],
  );

  return row ?? null;
}

export async function saveReadingPosition(position: ReadingPosition) {
  const database = await getDatabase();
  await database.runAsync(
    `
      INSERT INTO reading_positions (book_id, chapter_id, paragraph_index, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(book_id) DO UPDATE SET
        chapter_id = excluded.chapter_id,
        paragraph_index = excluded.paragraph_index,
        updated_at = excluded.updated_at;
    `,
    [
      position.bookId,
      position.chapterId,
      position.paragraphIndex,
      position.updatedAt,
    ],
  );
}
