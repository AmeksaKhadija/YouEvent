require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

console.log('Tentative de connexion à la base de données...');

client.connect()
  .then(() => {
    console.log('✅ Connexion réussie à PostgreSQL !');
    return client.query('SELECT NOW()');
  })
  .then((res) => {
    console.log('🕒 Heure actuelle de la DB:', res.rows[0].now);
    return client.end();
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion:', err.message);
    process.exit(1);
  });
