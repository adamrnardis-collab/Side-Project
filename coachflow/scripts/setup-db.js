const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'coachflow.db');

// Create database
const db = new Database(dbPath);

console.log('Creating CoachFlow database schema...');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Coaches table
db.exec(`
  CREATE TABLE IF NOT EXISTS coaches (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at INTEGER NOT NULL,
    trial_start_date INTEGER NOT NULL,
    trial_days_remaining INTEGER NOT NULL DEFAULT 7,
    niche TEXT NOT NULL,
    offer_type TEXT NOT NULL,
    price_range TEXT NOT NULL,
    audience_size TEXT NOT NULL,
    biggest_fear TEXT NOT NULL,
    current_streak INTEGER DEFAULT 0,
    last_action_date INTEGER,
    avoided_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0
  )
`);

// Daily actions table
db.exec(`
  CREATE TABLE IF NOT EXISTS daily_actions (
    id TEXT PRIMARY KEY,
    coach_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    draft_text TEXT,
    difficulty INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    completed_at INTEGER,
    avoided_at INTEGER,
    rewrite_count INTEGER DEFAULT 0,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE
  )
`);

// Agent interactions table (for learning and adaptation)
db.exec(`
  CREATE TABLE IF NOT EXISTS agent_interactions (
    id TEXT PRIMARY KEY,
    coach_id TEXT NOT NULL,
    action_id TEXT,
    interaction_type TEXT NOT NULL,
    context TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
    FOREIGN KEY (action_id) REFERENCES daily_actions(id) ON DELETE SET NULL
  )
`);

// Create indexes
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_coaches_email ON coaches(email);
  CREATE INDEX IF NOT EXISTS idx_daily_actions_coach_date ON daily_actions(coach_id, date);
  CREATE INDEX IF NOT EXISTS idx_daily_actions_status ON daily_actions(status);
  CREATE INDEX IF NOT EXISTS idx_agent_interactions_coach ON agent_interactions(coach_id);
`);

console.log('✅ Database schema created successfully!');
console.log(`📁 Database location: ${dbPath}`);

db.close();
