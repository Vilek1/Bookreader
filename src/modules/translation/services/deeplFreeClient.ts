import { DEEPL_FREE_API_ENDPOINT, DEEPL_FREE_API_KEY } from '../config/deeplConfig';

const deeplTargetLanguageMap: Record<string, string> = {
  'pl-PL': 'PL',
  'ru-RU': 'RU',
  'uk-UA': 'UK',
};

type DeepLTranslateResponse = {
  translations?: { text?: string }[];
};

export async function translateWithDeepLFree(input: {
  text: string;
  targetLanguage: string;
}) {
  const targetLanguage = resolveDeepLTargetLanguage(input.targetLanguage);
  const requestBody = createRequestBody(input.text, targetLanguage);

  let response: Response;
  try {
    response = await fetch(DEEPL_FREE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_FREE_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Network error: ${error.message}`
        : 'Network error while contacting DeepL.',
    );
  }

  if (!response.ok) {
    throw new Error(`Translation request failed (${response.status}).`);
  }

  const payload = (await response.json()) as DeepLTranslateResponse;
  const translatedText = payload.translations?.[0]?.text?.trim();

  if (!translatedText) {
    throw new Error('Empty response from translation service.');
  }

  return translatedText;
}

function resolveDeepLTargetLanguage(targetLanguage: string) {
  return deeplTargetLanguageMap[targetLanguage] ?? 'PL';
}

function createRequestBody(text: string, targetLanguage: string) {
  // Keep source language unset so DeepL can auto-detect it.
  return `text=${encodeURIComponent(text)}&target_lang=${encodeURIComponent(targetLanguage)}`;
}
