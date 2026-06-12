import db from './connection.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Migration {
  version: string;
  name: string;
  appliedAt?: string;
}

function getMigrationVersionFromFilename(filename: string): string {
  return filename.split('_')[0];
}

export async function runMigrations(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create migrations table if not exists
    db.run(
      `
      CREATE TABLE IF NOT EXISTS _migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
      (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Get all SQL files from migrations directory
        const migrationFiles = [
          '001_initial_schema.sql',
          '002_add_indexes.sql',
        ];

        let completed = 0;

        migrationFiles.forEach((file) => {
          const version = getMigrationVersionFromFilename(file);

          // Check if migration already applied
          db.get(
            'SELECT * FROM _migrations WHERE version = ?',
            [version],
            (err, row) => {
              if (err) {
                reject(err);
                return;
              }

              if (!row) {
                // Migration not applied yet
                try {
                  const migrationPath = join(__dirname, 'migrations', file);
                  const sql = readFileSync(migrationPath, 'utf8');

                  db.exec(sql, (err) => {
                    if (err) {
                      console.error(`Failed to apply migration ${file}:`, err);
                      reject(err);
                      return;
                    }

                    // Record migration
                    db.run(
                      'INSERT INTO _migrations (version, name) VALUES (?, ?)',
                      [version, file],
                      (err) => {
                        if (err) {
                          reject(err);
                          return;
                        }

                        console.log(`✓ Applied migration: ${file}`);
                        completed++;

                        if (completed === migrationFiles.length) {
                          resolve();
                        }
                      }
                    );
                  });
                } catch (err) {
                  reject(err);
                }
              } else {
                console.log(`⊘ Already applied: ${file}`);
                completed++;

                if (completed === migrationFiles.length) {
                  resolve();
                }
              }
            }
          );
        });
      }
    );
  });
}
