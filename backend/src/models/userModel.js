const db = require('../config/db');

const User = {
  create: async (name, email, password) => {
    // Le rôle est 'participant' par défaut dans la BDD (YOUEV-33)
    const query = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, role, created_at;
    `;
    const values = [name, email, password];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  findByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }
};

module.exports = User;
