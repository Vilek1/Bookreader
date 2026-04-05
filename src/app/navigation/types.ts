export type RootStackParamList = {
  BookHome: undefined;
  Library: undefined;
  Settings: undefined;
  BookDetails: { bookId: string };
  Chapters: { bookId: string };
  Reader: { bookId: string; initialParagraphIndex?: number };
  Words: { bookId: string };
};
