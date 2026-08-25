const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const House = require("../models/House");
const Wand = require("../models/Wand");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().populate("house").populate("wand").select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo usuarios", error: error.message });
  }
});

router.get("/:id", validateObjectId, verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "No puedes consultar este usuario" });
    }

    const user = await User.findById(req.params.id).populate("house").populate("wand").select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo usuario", error: error.message });
  }
});

router.put("/:id", validateObjectId, verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userToEdit = await User.findById(id);

    if (!userToEdit) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "No puedes modificar este usuario" });
    }

    if (req.body.house && !mongoose.isValidObjectId(req.body.house)) {
      return res.status(400).json({ message: "El ID de la casa no es válido" });
    }

    if (req.body.wand && !mongoose.isValidObjectId(req.body.wand)) {
      return res.status(400).json({ message: "El ID de la varita no es válido" });
    }

    const [houseExists, wandExists] = await Promise.all([
      req.body.house ? House.exists({ _id: req.body.house }) : true,
      req.body.wand ? Wand.exists({ _id: req.body.wand }) : true,
    ]);

    if (!houseExists || !wandExists) {
      return res.status(400).json({ message: "La casa o la varita seleccionadas no existen" });
    }

    const allowedFields = ["name", "email", "house", "wand"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) userToEdit[field] = req.body[field];
    });

    if (req.user.role === "admin" && req.body.role) {
      if (!["user", "admin"].includes(req.body.role)) {
        return res.status(400).json({ message: "Rol no válido" });
      }
      userToEdit.role = req.body.role;
    }

    await userToEdit.save();

    const updatedUser = await User.findById(id).populate("house").populate("wand");

    res.json({
      message: "Usuario actualizado",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error actualizando usuario", error: error.message });
  }
});

router.delete("/:id", validateObjectId, verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      return res.json({ message: "Usuario eliminado correctamente" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Solo un administrador puede eliminar a otro usuario" });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado por administrador" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando usuario", error: error.message });
  }
});

module.exports = router;
