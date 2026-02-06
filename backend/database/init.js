const db = require('../src/config/db');

const createUsersTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'participant',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(queryText);
    console.log('Table "users" créée avec succès (si elle n\'existait pas)');
  } catch (error) {
    console.error('Erreur lors de la création de la table users:', error);
  }
};

module.exports = { createUsersTable };
