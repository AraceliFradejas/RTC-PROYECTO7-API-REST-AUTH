const express = require("express");
const Wand = require("../models/Wand");
const User = require("../models/User");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const wands = await Wand.find();
    res.json(wands);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo varitas", error: error.message });
  }
});

router.get("/:id", validateObjectId, async (req, res) => {
  try {
    const wand = await Wand.findById(req.params.id);

    if (!wand) {
      return res.status(404).json({ message: "Varita no encontrada" });
    }

    res.json(wand);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo varita", error: error.message });
  }
});

router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const wand = await Wand.create(req.body);
    res.status(201).json(wand);
  } catch (error) {
    res.status(500).json({ message: "Error creando varita", error: error.message });
  }
});

router.put("/:id", validateObjectId, verifyToken, isAdmin, async (req, res) => {
  try {
    const wand = await Wand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!wand) {
      return res.status(404).json({ message: "Varita no encontrada" });
    }

    res.json(wand);
  } catch (error) {
    res.status(500).json({ message: "Error actualizando varita", error: error.message });
  }
});

router.delete("/:id", validateObjectId, verifyToken, isAdmin, async (req, res) => {
  try {
    const wandInUse = await User.exists({ wand: req.params.id });

    if (wandInUse) {
      return res.status(409).json({ message: "No se puede eliminar una varita asignada a usuarios" });
    }

    const wand = await Wand.findByIdAndDelete(req.params.id);

    if (!wand) {
      return res.status(404).json({ message: "Varita no encontrada" });
    }

    res.json({ message: "Varita eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando varita", error: error.message });
  }
});

module.exports = router;
