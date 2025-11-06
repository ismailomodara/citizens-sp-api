import { config } from 'dotenv';
import { getPool, query, closePool } from '../config/database.js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function ensureMigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getExecutedMigrations(): Promise<string[]> {
  const result = await query<{ name: string }>('SELECT name FROM migrations ORDER BY id');
  return result.rows.map(row => row.name);
}

async function runMigration(migrationName: string, sql: string): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Run the migration SQL
    await client.query(sql);
    
    // Record the migration
    await client.query(
      'INSERT INTO migrations (name) VALUES ($1)',
      [migrationName]
    );
    
    await client.query('COMMIT');
    console.log(`✅ Migration ${migrationName} executed successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Migration ${migrationName} failed:`, errorMessage);
    throw error;
  } finally {
    client.release();
  }
}

async function runMigrations(): Promise<void> {
  try {
    console.log('Starting migrations...⏳');
    
    await ensureMigrationsTable();
    
    const migrationsDir = join(__dirname, 'files');
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    const executedMigrations = await getExecutedMigrations();
    
    for (const file of files) {
      const migrationName = file.replace('.sql', '');
      
      if (executedMigrations.includes(migrationName)) {
        console.log(`- Skipping ${migrationName} (already executed)`);
        continue;
      }
      
      console.log(`Running migration: ${migrationName}`);
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      await runMigration(migrationName, sql);
    }
    
    console.log('All migrations completed successfully! ✅');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await closePool();
    process.exit(0);
  }
}

runMigrations();

