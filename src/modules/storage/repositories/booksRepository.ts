import { getDatabase } from '../db/database';
import type {
  Book,
  BookListItem,
  BookWordsSummary,
  Chapter,
  ParagraphBlock,
} from '../types/models';

type InsertBookInput = Omit<
  Book,
  'createdAt' | 'updatedAt' | 'lastOpenedAt'
> & {
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string | null;
};

export async function listBooks(): Promise<BookListItem[]> {
  const database = await getDatabase();

  const rows = await database.getAllAsync<{
    id: string;
    title: string;
    author: string;
    file_uri: string;
    cover_uri: string | null;
    has_cover: number;
    created_at: string;
    updated_at: string;
    last_opened_at: string | null;
    progress_percent: number | null;
  }>(`
    SELECT
      books.*,
      COALESCE(
        ROUND(
          100.0 * (
            SELECT reading_positions.paragraph_index + 1
            FROM reading_positions
            WHERE reading_positions.book_id = books.id
          ) / NULLIF((
            SELECT COUNT(*) FROM paragraph_blocks WHERE paragraph_blocks.book_id = books.id
          ), 0)
        ),
        0
      ) AS progress_percent
    FROM books
    ORDER BY COALESCE(last_opened_at, updated_at) DESC;
  `);

  return rows.map(mapBookListRow);
}

export async function getBookById(bookId: string): Promise<Book | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{
    id: string;
    title: string;
    author: string;
    file_uri: string;
    cover_uri: string | null;
    has_cover: number;
    created_at: string;
    updated_at: string;
    last_opened_at: string | null;
  }>('SELECT * FROM books WHERE id = ? LIMIT 1;', [bookId]);

  return row ? mapBookRow(row) : null;
}

export async function getBookWordsSummary(
  bookId: string,
): Promise<BookWordsSummary> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{
    savedCount: number;
    translatedCount: number;
  }>(
    `
    SELECT
      (SELECT COUNT(*) FROM saved_words WHERE book_id = ?) AS savedCount,
      (SELECT COUNT(*) FROM translated_words WHERE book_id = ?) AS translatedCount
  `,
    [bookId, bookId],
  );

  return row ?? { savedCount: 0, translatedCount: 0 };
}

export async function getBookChapters(bookId: string): Promise<Chapter[]> {
  const database = await getDatabase();

  return database.getAllAsync<Chapter>(
    `
      SELECT
        id,
        book_id as bookId,
        title,
        order_index as orderIndex,
        level,
        start_paragraph_index as startParagraphIndex
      FROM chapters
      WHERE book_id = ?
      ORDER BY order_index ASC;
    `,
    [bookId],
  );
}

export async function getBookParagraphs(
  bookId: string,
): Promise<ParagraphBlock[]> {
  const database = await getDatabase();

  return database.getAllAsync<ParagraphBlock>(
    `
      SELECT
        id,
        book_id as bookId,
        chapter_id as chapterId,
        order_index as orderIndex,
        type,
        text,
        style_variant as styleVariant
      FROM paragraph_blocks
      WHERE book_id = ?
      ORDER BY order_index ASC;
    `,
    [bookId],
  );
}

export async function insertImportedBook(input: {
  book: InsertBookInput;
  chapters: Chapter[];
  paragraphs: ParagraphBlock[];
}) {
  const database = await getDatabase();
  const { book, chapters, paragraphs } = input;

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `
        INSERT INTO books (
          id, title, author, file_uri, cover_uri, has_cover, created_at, updated_at, last_opened_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [
        book.id,
        book.title,
        book.author,
        book.fileUri,
        book.coverUri,
        book.hasCover,
        book.createdAt,
        book.updatedAt,
        book.lastOpenedAt ?? null,
      ],
    );

    for (const chapter of chapters) {
      await database.runAsync(
        `
          INSERT INTO chapters (
            id, book_id, title, order_index, level, start_paragraph_index
          ) VALUES (?, ?, ?, ?, ?, ?);
        `,
        [
          chapter.id,
          chapter.bookId,
          chapter.title,
          chapter.orderIndex,
          chapter.level,
          chapter.startParagraphIndex,
        ],
      );
    }

    for (const paragraph of paragraphs) {
      await database.runAsync(
        `
          INSERT INTO paragraph_blocks (
            id, book_id, chapter_id, order_index, type, text, style_variant
          ) VALUES (?, ?, ?, ?, ?, ?, ?);
        `,
        [
          paragraph.id,
          paragraph.bookId,
          paragraph.chapterId,
          paragraph.orderIndex,
          paragraph.type,
          paragraph.text,
          paragraph.styleVariant,
        ],
      );
    }
  });
}

export async function touchBookOpened(bookId: string, timestamp: string) {
  const database = await getDatabase();

  await database.runAsync(
    'UPDATE books SET last_opened_at = ?, updated_at = ? WHERE id = ?;',
    [timestamp, timestamp, bookId],
  );
}

export async function deleteBook(bookId: string) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM books WHERE id = ?;', [bookId]);
}

function mapBookRow(row: {
  id: string;
  title: string;
  author: string;
  file_uri: string;
  cover_uri: string | null;
  has_cover: number;
  created_at: string;
  updated_at: string;
  last_opened_at: string | null;
}): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    fileUri: row.file_uri,
    coverUri: row.cover_uri,
    hasCover: row.has_cover,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastOpenedAt: row.last_opened_at,
  };
}

function mapBookListRow(row: {
  id: string;
  title: string;
  author: string;
  file_uri: string;
  cover_uri: string | null;
  has_cover: number;
  created_at: string;
  updated_at: string;
  last_opened_at: string | null;
  progress_percent: number | null;
}): BookListItem {
  return {
    ...mapBookRow(row),
    progressPercent: row.progress_percent ?? 0,
  };
}
