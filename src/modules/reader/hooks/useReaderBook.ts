import { useQueries } from '@tanstack/react-query';

import {
  getBookById,
  getBookChapters,
  getBookParagraphs,
} from '@/modules/storage/repositories/booksRepository';
import { getReadingPosition } from '@/modules/storage/repositories/readerRepository';

export function useReaderBook(bookId: string) {
  const [bookQuery, chaptersQuery, paragraphsQuery, readingPositionQuery] =
    useQueries({
      queries: [
        { queryKey: ['book', bookId], queryFn: () => getBookById(bookId) },
        {
          queryKey: ['chapters', bookId],
          queryFn: () => getBookChapters(bookId),
        },
        {
          queryKey: ['paragraphs', bookId],
          queryFn: () => getBookParagraphs(bookId),
        },
        {
          queryKey: ['reading-position', bookId],
          queryFn: () => getReadingPosition(bookId),
        },
      ],
    });

  return {
    bookQuery,
    chaptersQuery,
    paragraphsQuery,
    readingPositionQuery,
  };
}
