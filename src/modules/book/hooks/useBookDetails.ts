import { useQueries } from '@tanstack/react-query';

import {
  getBookById,
  getBookChapters,
  getBookWordsSummary,
  listBooks,
} from '@/modules/storage/repositories/booksRepository';

export function useBookDetails(bookId: string) {
  const [bookQuery, summaryQuery, booksQuery, chaptersQuery] = useQueries({
    queries: [
      { queryKey: ['book', bookId], queryFn: () => getBookById(bookId) },
      {
        queryKey: ['book-words-summary', bookId],
        queryFn: () => getBookWordsSummary(bookId),
      },
      { queryKey: ['books'], queryFn: listBooks },
      {
        queryKey: ['chapters', bookId],
        queryFn: () => getBookChapters(bookId),
      },
    ],
  });

  const progressPercent =
    booksQuery.data?.find((book) => book.id === bookId)?.progressPercent ?? 0;

  return {
    bookQuery,
    summaryQuery,
    chaptersQuery,
    progressPercent,
  };
}
