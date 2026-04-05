import * as SQLite from 'expo-sqlite';

import { runMigrations } from '../migrations/migrations';

let database: SQLite.SQLiteDatabase | null = null;

export async function initializeDatabase() {
  if (database) {
    return database;
  }

  database = await SQLite.openDatabaseAsync('bookreader.db');
  await database.execAsync('PRAGMA foreign_keys = ON;');
  await database.execAsync('PRAGMA journal_mode = WAL;');
  await runMigrations(database);

  return database;
}

export async function getDatabase() {
  if (!database) {
    return initializeDatabase();
  }

  return database;
}
