# Architecture

## App foundation
- Expo Prebuild
- TypeScript
- React Navigation native stack
- React Query for async state
- SQLite for local-first persistence

## Modules
- `library`: list, import entry, delete flow
- `fb2-import`: file picker, parser, cover extraction
- `book`: details, progress, words summary
- `reader`: paragraph rendering, TOC, restore position, translation entry points
- `words`: saved and translated collections
- `translation`: cache-aware provider abstraction
- `storage`: SQLite schema, migrations, repositories
- `theme`: temporary token layer until Figma tokens are imported

## Data flow
1. User imports FB2
2. File is copied into sandbox
3. XML is parsed into metadata, chapters, and paragraph blocks
4. Parsed data is stored in SQLite
5. Screens query SQLite through repositories
6. Translation results update cache and word collections
