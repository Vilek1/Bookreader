import type * as SQLite from 'expo-sqlite';

const migrations = [
  `
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      file_uri TEXT NOT NULL,
      cover_uri TEXT,
      has_cover INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_opened_at TEXT
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY NOT NULL,
      book_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      level INTEGER NOT NULL,
      start_paragraph_index INTEGER NOT NULL,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS paragraph_blocks (
      id TEXT PRIMARY KEY NOT NULL,
      book_id TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      type TEXT NOT NULL,
      text TEXT NOT NULL,
      style_variant TEXT,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS reading_positions (
      book_id TEXT PRIMARY KEY NOT NULL,
      chapter_id TEXT NOT NULL,
      paragraph_index INTEGER NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS translated_words (
      id TEXT PRIMARY KEY NOT NULL,
      book_id TEXT NOT NULL,
      word TEXT NOT NULL,
      normalized_word TEXT NOT NULL,
      translation TEXT NOT NULL,
      context_sentence TEXT NOT NULL,
      translated_sentence TEXT NOT NULL,
      last_translated_at TEXT NOT NULL,
      translate_count INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS translated_words_unique
    ON translated_words (book_id, normalized_word, context_sentence);
  `,
  `
    CREATE TABLE IF NOT EXISTS saved_words (
      id TEXT PRIMARY KEY NOT NULL,
      book_id TEXT NOT NULL,
      word TEXT NOT NULL,
      normalized_word TEXT NOT NULL,
      translation TEXT NOT NULL,
      example_sentence TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS saved_words_unique
    ON saved_words (book_id, normalized_word);
  `,
  `
    CREATE TABLE IF NOT EXISTS translation_cache (
      id TEXT PRIMARY KEY NOT NULL,
      cache_key TEXT NOT NULL UNIQUE,
      source_text TEXT NOT NULL,
      source_language TEXT NOT NULL,
      target_language TEXT NOT NULL,
      context_hash TEXT,
      translated_text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
      theme_mode TEXT NOT NULL DEFAULT 'system',
      reader_font_size INTEGER NOT NULL DEFAULT 16,
      reader_text_alignment TEXT NOT NULL DEFAULT 'left',
      app_language TEXT NOT NULL DEFAULT 'en-US',
      translation_language TEXT NOT NULL DEFAULT 'pl-PL',
      translation_provider TEXT NOT NULL DEFAULT 'deepl_free',
      updated_at TEXT NOT NULL
    );
  `,
  `
    INSERT OR IGNORE INTO app_settings (
      id,
      theme_mode,
      reader_font_size,
      reader_text_alignment,
      app_language,
      translation_language,
      translation_provider,
      updated_at
    ) VALUES (
      1,
      'system',
      16,
      'left',
      'en-US',
      'pl-PL',
      'deepl_free',
      CURRENT_TIMESTAMP
    );
  `,
];

export async function runMigrations(database: SQLite.SQLiteDatabase) {
  for (const sql of migrations) {
    await database.execAsync(sql);
  }

  await ensureAppSettingsColumns(database);
}

async function ensureAppSettingsColumns(database: SQLite.SQLiteDatabase) {
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
