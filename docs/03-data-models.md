# Data Models

## Book
- Stores title, author, local FB2 file path, local cover path, timestamps, and last-opened timestamp

## Chapter
- Stores logical chapter structure with `startParagraphIndex` anchor for TOC jumps

## ParagraphBlock
- Stores flattened renderable reader blocks with stable order index

## ReadingPosition
- Stores `chapterId + paragraphIndex`
- Avoids raw pixel offsets

## TranslatedWord
- Auto-created on successful word translation
- Tracks translation count and last translated time

## SavedWord
- Manually toggled from translation sheet
- Independent from TranslatedWord list

## TranslationCache
- Stores reusable translation responses by normalized cache key
