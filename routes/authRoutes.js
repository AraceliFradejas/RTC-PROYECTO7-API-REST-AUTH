const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const House = require("../models/House");
const Wand = require("../models/Wand");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, house, wand } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password ||
      !house ||
      !wand
    ) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    if (!mongoose.isValidObjectId(house) || !mongoose.isValidObjectId(wand)) {
      return res.status(400).json({ message: "La casa o la varita no tienen un ID válido" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "El usuario ya existe" });
    }

    const [houseExists, wandExists] = await Promise.all([
      House.exists({ _id: house }),
      Wand.exists({ _id: wand }),
    ]);

    if (!houseExists || !wandExists) {
      return res.status(400).json({ message: "La casa o la varita seleccionadas no existen" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      house,
      wand,
      role: "user",
    });

    const userResponse = await User.findById(newUser._id)
      .populate("house")
      .populate("wand")
      .select("-password");

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y password son obligatorios" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    const userResponse = await User.findById(user._id)
      .populate("house")
      .populate("wand")
      .select("-password");

    res.status(200).json({
      message: "Login correcto",
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
  }
});

module.exports = router;
