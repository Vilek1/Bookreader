import { XMLParser } from 'fast-xml-parser';

import { createId } from '@/modules/shared/utils/ids';
import type { Chapter, ParagraphBlock } from '@/modules/storage/types/models';

import type { ParsedFb2Book } from '../types/fb2';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
  parseTagValue: false,
});

type AnyRecord = Record<string, unknown>;

export function parseFb2(xmlContent: string, bookId: string): ParsedFb2Book {
  const parsed = parser.parse(xmlContent) as { FictionBook?: AnyRecord };

  if (!parsed.FictionBook) {
    throw new Error('The selected file does not look like a valid FB2 book.');
  }

  const description = asRecord(parsed.FictionBook.description);
  const titleInfo = asRecord(description?.['title-info']);
  const documentInfo = asRecord(description?.['document-info']);

  const title =
    asString(titleInfo?.['book-title']) ||
    asString(documentInfo?.['id']) ||
    'Untitled book';

  const author = extractAuthorName(titleInfo?.author) || extractAuthorName(documentInfo?.author);

  const coverBinaryId = extractCoverBinaryId(titleInfo?.['coverpage']);
  const binaries = normalizeArray(parsed.FictionBook.binary).map(asRecord);
  const coverBinary = binaries.find(
    (item) => item?.['@_id'] === coverBinaryId || item?.['@_id'] === coverBinaryId?.replace('#', ''),
  );
  const coverBase64 = asString(coverBinary?.['#text']) || asString(coverBinary);

  const body = normalizeArray(parsed.FictionBook.body).find(
    (item) => asRecord(item)?.['@_name'] !== 'notes',
  );

  const { chapters, paragraphs } = parseBodyToContent(bookId, body);

  const fallbackChapterId = chapters[0]?.id ?? createId('chapter');

  return {
    title,
    author: author || 'Unknown author',
    coverBase64: coverBase64 || null,
    chapters:
      chapters.length > 0
        ? chapters
        : [
            {
              id: fallbackChapterId,
              bookId,
              title: 'Start',
              orderIndex: 0,
              level: 1,
              startParagraphIndex: 0,
            },
          ],
    paragraphs:
      paragraphs.length > 0
        ? paragraphs
        : [
            {
              id: createId('paragraph'),
              bookId,
              chapterId: fallbackChapterId,
              orderIndex: 0,
              type: 'paragraph',
              text: 'This book could not be split into chapters, but the content was imported.',
              styleVariant: null,
            },
          ],
  };
}

function parseBodyToContent(
  bookId: string,
  bodyNode: unknown,
): { chapters: Chapter[]; paragraphs: ParagraphBlock[] } {
  const body = asRecord(bodyNode);
  const sections = normalizeArray(body?.section);
  const paragraphs: ParagraphBlock[] = [];
  const chapters: Chapter[] = [];

  if (sections.length === 0) {
    const chapterId = createId('chapter');
    chapters.push({
      id: chapterId,
      bookId,
      title: 'Start',
      orderIndex: 0,
      level: 1,
      startParagraphIndex: 0,
    });

    extractParagraphs(body, {
      bookId,
      chapterId,
      paragraphs,
      startIndex: 0,
    });

    return { chapters, paragraphs };
  }

  sections.forEach((sectionNode, sectionIndex) => {
    walkSection({
      bookId,
      node: sectionNode,
      level: 1,
      chapters,
      paragraphs,
      sectionIndex,
    });
  });

  return { chapters, paragraphs };
}

function walkSection(input: {
  bookId: string;
  node: unknown;
  level: number;
  chapters: Chapter[];
  paragraphs: ParagraphBlock[];
  sectionIndex: number;
}) {
  const section = asRecord(input.node);
  if (!section) {
    return;
  }

  const titleNode = normalizeArray(asRecord(section.title)?.p)
    .map(asString)
    .filter(Boolean)
    .join(' ');
  const chapterId = createId('chapter');
  const title = titleNode || `Chapter ${input.chapters.length + 1}`;

  input.chapters.push({
    id: chapterId,
    bookId: input.bookId,
    title,
    orderIndex: input.chapters.length,
    level: input.level,
    startParagraphIndex: input.paragraphs.length,
  });

  if (titleNode) {
    input.paragraphs.push({
      id: createId('paragraph'),
      bookId: input.bookId,
      chapterId,
      orderIndex: input.paragraphs.length,
      type: 'heading',
      text: titleNode,
      styleVariant: `h${Math.min(input.level, 3)}`,
    });
  }

  extractParagraphs(section, {
    bookId: input.bookId,
    chapterId,
    paragraphs: input.paragraphs,
    startIndex: input.paragraphs.length,
  });

  normalizeArray(section.section).forEach((nestedSection, nestedIndex) => {
    walkSection({
      ...input,
      node: nestedSection,
      level: input.level + 1,
      sectionIndex: nestedIndex,
    });
  });
}

function extractParagraphs(
  node: AnyRecord | null,
  input: {
    bookId: string;
    chapterId: string;
    paragraphs: ParagraphBlock[];
    startIndex: number;
  },
) {
  if (!node) {
    return;
  }

  const paragraphNodes = normalizeArray(node.p);
  const poemNodes = normalizeArray(node.poem);

  paragraphNodes.forEach((paragraphNode) => {
    const text = extractText(paragraphNode);

    if (!text) {
      return;
    }

    input.paragraphs.push({
      id: createId('paragraph'),
      bookId: input.bookId,
      chapterId: input.chapterId,
      orderIndex: input.paragraphs.length,
      type: 'paragraph',
      text,
      styleVariant: null,
    });
  });

  poemNodes.forEach((poemNode) => {
    const poem = asRecord(poemNode);
    const stanzaLines = normalizeArray(poem?.stanza)
      .flatMap((stanza) => normalizeArray(asRecord(stanza)?.v))
      .map(extractText)
      .filter(Boolean);

    if (stanzaLines.length === 0) {
      return;
    }

    input.paragraphs.push({
      id: createId('paragraph'),
      bookId: input.bookId,
      chapterId: input.chapterId,
      orderIndex: input.paragraphs.length,
      type: 'poem',
      text: stanzaLines.join('\n'),
      styleVariant: null,
    });
  });
}

function extractCoverBinaryId(coverPage: unknown) {
  const imageNode = asRecord(coverPage)?.image ?? asRecord(coverPage)?.['xlink:image'];
  const href = asRecord(imageNode)?.['@_l:href'] ?? asRecord(imageNode)?.['@_xlink:href'];

  return typeof href === 'string' ? href.replace('#', '') : null;
}

function extractText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(extractText).join(' ').trim();
  }

  if (value && typeof value === 'object') {
    return Object.values(value as AnyRecord)
      .map(extractText)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return '';
}

function normalizeArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  return value == null ? [] : [value];
}

function asRecord(value: unknown): AnyRecord | null {
  return value && typeof value === 'object' ? (value as AnyRecord) : null;
}

function asString(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  return '';
}

function extractAuthorName(value: unknown): string {
  const authors = normalizeArray(value)
    .map(asRecord)
    .filter(Boolean);

  for (const author of authors) {
    const name = [
      asString(author?.first),
      asString(author?.middle),
      asString(author?.last),
      asString(author?.nickname),
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (name) {
      return name;
    }
  }

  return '';
}
