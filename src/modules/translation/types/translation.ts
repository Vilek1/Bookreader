import type { TranslationProvider } from '@/modules/storage/types/models';

export type TranslationMode = 'word' | 'paragraph';

export type TranslationRequest = {
  bookId: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider: TranslationProvider;
  contextSentence?: string;
  mode: TranslationMode;
};

export type TranslationResult = {
  translatedText: string;
  translatedSentence: string;
  provider: TranslationProvider;
  fromCache: boolean;
};
