import pg from 'pg';
import sqlite3 from 'sqlite3';
import { existsSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let dbType = 'sqlite';
let pgPool = null;
let sqliteDb = null;

// Helper to check if PG is configured
const isPgConfigured = process.env.PGHOST || process.env.DATABASE_URL;

if (isPgConfigured) {
  try {
    const config = process.env.DATABASE_URL 
      ? { 
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        }
      : {
          host: process.env.PGHOST,
          port: process.env.PGPORT || 5432,
          database: process.env.PGDATABASE,
          user: process.env.PGUSER,
          password: process.env.PGPASSWORD,
          ssl: { rejectUnauthorized: false }
        };
    pgPool = new pg.Pool(config);
    dbType = 'postgres';
    console.log('🔌 Connected to PostgreSQL Database');
  } catch (err) {
    console.error('❌ Failed to initialize PostgreSQL client. Falling back to SQLite.', err.message);
    dbType = 'sqlite';
  }
}

if (dbType === 'sqlite') {
  // In Vercel serverless containers, the root filesystem is read-only.
  // We use '/tmp' for the database file to allow database creation and updates.
  const dbPath = process.env.VERCEL 
    ? path.join('/tmp', 'carboniq.db') 
    : path.resolve('carboniq.db');
  console.log(`🔌 Using SQLite Database at: ${dbPath}`);
  sqliteDb = new sqlite3.Database(dbPath);
}

// Promisified query helper
export function query(text, params = []) {
  if (dbType === 'postgres') {
    return pgPool.query(text, params);
  } else {
    return new Promise((resolve, reject) => {
      // Convert $1, $2 to ?, ? for SQLite compatibility
      const sqliteText = text.replace(/\$(\d+)/g, '?');
      
      if (sqliteText.trim().toUpperCase().startsWith('SELECT')) {
        sqliteDb.all(sqliteText, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows });
        });
      } else {
        sqliteDb.run(sqliteText, params, function (err) {
          if (err) reject(err);
          else resolve({ rows: [], lastID: this.lastID, changes: this.changes });
        });
      }
    });
  }
}

// Initialize tables
export async function initDatabase() {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      carbon_score REAL DEFAULT 0,
      points INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const pgUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      carbon_score REAL DEFAULT 0,
      points INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const assessmentsTable = `
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      transport_emissions REAL DEFAULT 0,
      food_emissions REAL DEFAULT 0,
      energy_emissions REAL DEFAULT 0,
      shopping_emissions REAL DEFAULT 0,
      travel_emissions REAL DEFAULT 0,
      waste_emissions REAL DEFAULT 0,
      total_footprint REAL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const pgAssessmentsTable = `
    CREATE TABLE IF NOT EXISTS assessments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      transport_emissions REAL DEFAULT 0,
      food_emissions REAL DEFAULT 0,
      energy_emissions REAL DEFAULT 0,
      shopping_emissions REAL DEFAULT 0,
      travel_emissions REAL DEFAULT 0,
      waste_emissions REAL DEFAULT 0,
      total_footprint REAL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const emissionsLogsTable = `
    CREATE TABLE IF NOT EXISTS emissions_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      amount_co2 REAL NOT NULL,
      source TEXT NOT NULL,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const pgEmissionsLogsTable = `
    CREATE TABLE IF NOT EXISTS emissions_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      category VARCHAR(50) NOT NULL,
      amount_co2 REAL NOT NULL,
      source VARCHAR(100) NOT NULL,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const missionsTable = `
    CREATE TABLE IF NOT EXISTS missions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      points INTEGER NOT NULL,
      co2_savings REAL NOT NULL,
      category TEXT NOT NULL
    )
  `;

  const pgMissionsTable = `
    CREATE TABLE IF NOT EXISTS missions (
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      points INTEGER NOT NULL,
      co2_savings REAL NOT NULL,
      category VARCHAR(50) NOT NULL
    )
  `;

  const userMissionsTable = `
    CREATE TABLE IF NOT EXISTS user_missions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mission_id INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      completed_at TIMESTAMP
    )
  `;

  const pgUserMissionsTable = `
    CREATE TABLE IF NOT EXISTS user_missions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      mission_id INTEGER NOT NULL,
      status VARCHAR(20) DEFAULT 'active',
      completed_at TIMESTAMP
    )
  `;

  const challengesTable = `
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      points INTEGER NOT NULL,
      badge TEXT NOT NULL,
      category TEXT NOT NULL
    )
  `;

  const pgChallengesTable = `
    CREATE TABLE IF NOT EXISTS challenges (
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      points INTEGER NOT NULL,
      badge VARCHAR(50) NOT NULL,
      category VARCHAR(50) NOT NULL
    )
  `;

  const userChallengesTable = `
    CREATE TABLE IF NOT EXISTS user_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      progress REAL DEFAULT 0,
      completed_at TIMESTAMP
    )
  `;

  const pgUserChallengesTable = `
    CREATE TABLE IF NOT EXISTS user_challenges (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      progress REAL DEFAULT 0,
      completed_at TIMESTAMP
    )
  `;

  try {
    if (dbType === 'postgres') {
      await query(pgUsersTable.replace('INTEGER PRIMARY KEY AUTOINCREMENT', 'SERIAL PRIMARY KEY'));
      await query(pgAssessmentsTable);
      await query(pgEmissionsLogsTable);
      await query(pgMissionsTable);
      await query(pgUserMissionsTable);
      await query(pgChallengesTable);
      await query(pgUserChallengesTable);
      
      // PostgreSQL Indexes
      await query('CREATE INDEX IF NOT EXISTS idx_pg_assess_user ON assessments(user_id)');
      await query('CREATE INDEX IF NOT EXISTS idx_pg_logs_user ON emissions_logs(user_id)');
      await query('CREATE INDEX IF NOT EXISTS idx_pg_missions_user ON user_missions(user_id)');
      await query('CREATE INDEX IF NOT EXISTS idx_pg_challenges_user ON user_challenges(user_id)');
    } else {
      await query(usersTable);
      await query(assessmentsTable);
      await query(emissionsLogsTable);
      await query(missionsTable);
      await query(userMissionsTable);
      await query(challengesTable);
      await query(userChallengesTable);

      // SQLite Indexes
      await query('CREATE INDEX IF NOT EXISTS idx_lite_assess_user ON assessments(user_id)');
      await query('CREATE INDEX IF NOT EXISTS idx_lite_logs_user ON emissions_logs(user_id)');
      await query('CREATE INDEX IF NOT EXISTS idx_lite_missions_user ON user_missions(user_id)');
      await query('CREATE INDEX IF NOT EXISTS idx_lite_challenges_user ON user_challenges(user_id)');
    }
    
    // Seed standard missions and challenges if empty
    const checkMissions = await query('SELECT count(*) as count FROM missions');
    const missionCount = checkMissions.rows[0].count;
    if (parseInt(missionCount) === 0) {
      const defaultMissions = [
        ['Reduce AC usage by 30 mins', 'Turn down the air conditioning for at least 30 minutes today.', 50, 1.2, 'energy'],
        ['Bike to work or school', 'Avoid driving by cycling for your commute today.', 150, 4.5, 'transport'],
        ['Meat-free day', 'Eat only vegetarian or vegan meals today to reduce dietary impact.', 100, 3.1, 'food'],
        ['Avoid single-use plastics', 'Commit to using reusable bags, bottles, and utensils today.', 80, 0.8, 'waste'],
        ['Cold water laundry washing', 'Run your laundry washing machine with cold water instead of hot.', 60, 1.5, 'energy']
      ];
      
      for (const m of defaultMissions) {
        await query(
          'INSERT INTO missions (title, description, points, co2_savings, category) VALUES ($1, $2, $3, $4, $5)',
          m
        );
      }
      console.log('✅ Seeded default sustainability missions.');
    }

    const checkChallenges = await query('SELECT count(*) as count FROM challenges');
    const challengeCount = checkChallenges.rows[0].count;
    if (parseInt(challengeCount) === 0) {
      const defaultChallenges = [
        ['Plastic-Free Week', 'Go a full week without purchasing or using single-use plastics.', 500, 'plastic_ninja', 'waste'],
        ['Bike-to-Work Challenge', 'Commute via bicycle for 5 consecutive workdays.', 800, 'pedal_hero', 'transport'],
        ['Energy Saver Sprint', 'Reduce energy usage by 15% this week compared to your baseline.', 600, 'watt_saver', 'energy']
      ];

      for (const c of defaultChallenges) {
        await query(
          'INSERT INTO challenges (title, description, points, badge, category) VALUES ($1, $2, $3, $4, $5)',
          c
        );
      }
      console.log('✅ Seeded default community challenges.');
    }
    
    console.log('📊 Database schema initialized and seed complete.');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  }
}
