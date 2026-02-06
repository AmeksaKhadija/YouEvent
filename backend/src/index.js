require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createUsersTable } = require('../database/init');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialisation de la BDD
createUsersTable();

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('YouEvent API is running');
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
