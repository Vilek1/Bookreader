import type { Chapter, ParagraphBlock } from '@/modules/storage/types/models';

export type ParsedFb2Book = {
  title: string;
  author: string;
  coverBase64: string | null;
  chapters: Chapter[];
  paragraphs: ParagraphBlock[];
};
