import { useQuery } from '@tanstack/react-query';

import { listBooks } from '@/modules/storage/repositories/booksRepository';

export function useLibraryBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: listBooks,
  });
}
