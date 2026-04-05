import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { createId } from '@/modules/shared/utils/ids';
import { insertImportedBook } from '@/modules/storage/repositories/booksRepository';

import { parseFb2 } from '../parsers/parseFb2';

const BOOKS_DIRECTORY = `${FileSystem.documentDirectory ?? ''}books`;
const COVERS_DIRECTORY = `${FileSystem.documentDirectory ?? ''}covers`;

export async function importFb2Book() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/xml', 'text/xml', 'application/octet-stream', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  const pickedFile = result.assets[0];
  const isFb2File =
    pickedFile.name.toLowerCase().endsWith('.fb2') ||
    pickedFile.mimeType?.includes('xml');

  if (!isFb2File) {
    throw new Error('Please choose an FB2 file.');
  }

  await ensureDirectoryExists(BOOKS_DIRECTORY);
  await ensureDirectoryExists(COVERS_DIRECTORY);

  const bookId = createId('book');
  const destinationFileUri = `${BOOKS_DIRECTORY}/${bookId}.fb2`;

  await FileSystem.copyAsync({
    from: pickedFile.uri,
    to: destinationFileUri,
  });

  const xmlContent = await FileSystem.readAsStringAsync(destinationFileUri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const parsedBook = parseFb2(xmlContent, bookId);
  let coverUri: string | null = null;

  if (parsedBook.coverBase64) {
    coverUri = `${COVERS_DIRECTORY}/${bookId}.jpg`;
    await FileSystem.writeAsStringAsync(coverUri, parsedBook.coverBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  const now = new Date().toISOString();

  await insertImportedBook({
    book: {
      id: bookId,
      title: parsedBook.title || pickedFile.name.replace(/\.fb2$/i, ''),
      author: parsedBook.author,
      fileUri: destinationFileUri,
      coverUri,
      hasCover: coverUri ? 1 : 0,
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: null,
    },
    chapters: parsedBook.chapters.map((chapter) => ({
      ...chapter,
      bookId,
    })),
    paragraphs: parsedBook.paragraphs.map((paragraph) => ({
      ...paragraph,
      bookId,
    })),
  });

  return bookId;
}

async function ensureDirectoryExists(uri: string) {
  const info = await FileSystem.getInfoAsync(uri);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
  }
}
