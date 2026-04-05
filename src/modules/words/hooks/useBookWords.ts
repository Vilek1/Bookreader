import { useQueries } from '@tanstack/react-query';

import {
  listSavedWords,
  listTranslatedWords,
} from '@/modules/storage/repositories/wordsRepository';

export function useBookWords(bookId: string) {
  const [savedWordsQuery, translatedWordsQuery] = useQueries({
    queries: [
      {
        queryKey: ['saved-words', bookId],
        queryFn: () => listSavedWords(bookId),
      },
      {
        queryKey: ['translated-words', bookId],
        queryFn: () => listTranslatedWords(bookId),
      },
    ],
  });

  return {
    savedWordsQuery,
    translatedWordsQuery,
  };
}
