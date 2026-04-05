export type Book = {
  id: string;
  title: string;
  author: string;
  fileUri: string;
  coverUri: string | null;
  hasCover: number;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string | null;
};

export type BookListItem = Book & {
  progressPercent: number;
};

export type Chapter = {
  id: string;
  bookId: string;
  title: string;
  orderIndex: number;
  level: number;
  startParagraphIndex: number;
};

export type ParagraphBlockType = 'heading' | 'paragraph' | 'poem' | 'empty';

export type ParagraphBlock = {
  id: string;
  bookId: string;
  chapterId: string;
  orderIndex: number;
  type: ParagraphBlockType;
  text: string;
  styleVariant: string | null;
};

export type ReadingPosition = {
  bookId: string;
  chapterId: string;
  paragraphIndex: number;
  updatedAt: string;
};

export type TranslatedWord = {
  id: string;
  bookId: string;
  word: string;
  normalizedWord: string;
  translation: string;
  contextSentence: string;
  translatedSentence: string;
  lastTranslatedAt: string;
  translateCount: number;
};

export type SavedWord = {
  id: string;
  bookId: string;
  word: string;
  normalizedWord: string;
  translation: string;
  exampleSentence: string | null;
  createdAt: string;
};

export type TranslationCache = {
  id: string;
  cacheKey: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  contextHash: string | null;
  translatedText: string;
  createdAt: string;
  updatedAt: string;
};

export type BookWordsSummary = {
  savedCount: number;
  translatedCount: number;
};

export type ThemeMode = 'system' | 'light' | 'dark';

export type ReaderTextAlignment = 'left' | 'center' | 'right' | 'justify';

export type AppLanguage = 'en-US';

export type TranslationLanguage = 'pl-PL' | 'ru-RU' | 'uk-UA';

export type TranslationProvider = 'deepl_free' | 'mock';

export type AppSettings = {
  themeMode: ThemeMode;
  readerFontSize: number;
  readerTextAlignment: ReaderTextAlignment;
  appLanguage: AppLanguage;
  translationLanguage: TranslationLanguage;
  translationProvider: TranslationProvider;
};
