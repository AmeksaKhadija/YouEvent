const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation simple
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // YOUEV-31: Vérifier si l'email existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // YOUEV-32: Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'utilisateur (YOUEV-33: Rôle par défaut géré par le modèle/BDD)
    const newUser = await User.create(name, email, hashedPassword);

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { register };
