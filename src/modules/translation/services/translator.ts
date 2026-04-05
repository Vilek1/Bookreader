import { getCachedTranslation, upsertCachedTranslation } from '@/modules/storage/repositories/translationCacheRepository';
import { upsertTranslatedWord } from '@/modules/storage/repositories/wordsRepository';

import type { TranslationRequest, TranslationResult } from '../types/translation';
import { translateWithDeepLFree } from './deeplFreeClient';

export async function translateWord(request: TranslationRequest): Promise<TranslationResult> {
  const cacheKey = createTranslationCacheKey(request);
  const cached = await getCachedTranslation(cacheKey);
  const translatedText =
    cached?.translatedText ?? (await translateUsingProvider(request));
  const translatedSentence = createTranslatedSentence(
    request.contextSentence,
    translatedText,
  );

  if (!cached) {
    await upsertCachedTranslation({
      cacheKey,
      sourceText: request.sourceText,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      contextHash: request.contextSentence ? hashValue(request.contextSentence) : null,
      translatedText,
    });
  }

  await upsertTranslatedWord({
    bookId: request.bookId,
    word: request.sourceText,
    normalizedWord: normalizeWord(request.sourceText),
    translation: translatedText,
    contextSentence: request.contextSentence ?? '',
    translatedSentence,
    timestamp: new Date().toISOString(),
  });

  return {
    translatedText,
    translatedSentence,
    provider: request.provider,
    fromCache: Boolean(cached),
  };
}

export async function translateParagraph(
  request: TranslationRequest,
): Promise<TranslationResult> {
  const cacheKey = createTranslationCacheKey(request);
  const cached = await getCachedTranslation(cacheKey);
  const translatedText =
    cached?.translatedText ?? (await translateUsingProvider(request));

  if (!cached) {
    await upsertCachedTranslation({
      cacheKey,
      sourceText: request.sourceText,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      contextHash: request.contextSentence ? hashValue(request.contextSentence) : null,
      translatedText,
    });
  }

  return {
    translatedText,
    translatedSentence: translatedText,
    provider: request.provider,
    fromCache: Boolean(cached),
  };
}

export function createTranslationCacheKey(request: TranslationRequest) {
  return [
    request.provider,
    request.mode,
    resolveSourceCachePart(request),
    request.sourceLanguage,
    request.targetLanguage,
    request.contextSentence ? hashValue(request.contextSentence) : 'no-context',
  ].join('::');
}

export function normalizeWord(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}'-]+/gu, '').trim();
}

async function translateUsingProvider(request: TranslationRequest) {
  switch (request.provider) {
    case 'deepl_free':
      return translateWithDeepLFree({
        text: request.sourceText,
        targetLanguage: request.targetLanguage,
      });
    case 'mock':
      return `${request.sourceText} (${request.targetLanguage})`;
    default:
      throw new Error('Selected translation service is not available.');
  }
}

function resolveSourceCachePart(request: TranslationRequest) {
  if (request.mode === 'word') {
    return normalizeWord(request.sourceText);
  }

  return hashValue(request.sourceText);
}

function createTranslatedSentence(
  contextSentence: string | undefined,
  translatedText: string,
) {
  return contextSentence
    ? `${contextSentence}\n\nTranslation: ${translatedText}`
    : translatedText;
}

function hashValue(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return String(hash);
}
