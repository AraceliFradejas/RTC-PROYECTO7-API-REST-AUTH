const express = require("express");
const House = require("../models/House");
const User = require("../models/User");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const houses = await House.find();
    res.json(houses);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo casas", error: error.message });
  }
});

router.get("/:id", validateObjectId, async (req, res) => {
  try {
    const house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({ message: "Casa no encontrada" });
    }

    res.json(house);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo casa", error: error.message });
  }
});

router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const house = await House.create(req.body);
    res.status(201).json(house);
  } catch (error) {
    res.status(500).json({ message: "Error creando casa", error: error.message });
  }
});

router.put("/:id", validateObjectId, verifyToken, isAdmin, async (req, res) => {
  try {
    const house = await House.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!house) {
      return res.status(404).json({ message: "Casa no encontrada" });
    }

    res.json(house);
  } catch (error) {
    res.status(500).json({ message: "Error actualizando casa", error: error.message });
  }
});

router.delete("/:id", validateObjectId, verifyToken, isAdmin, async (req, res) => {
  try {
    const houseInUse = await User.exists({ house: req.params.id });

    if (houseInUse) {
      return res.status(409).json({ message: "No se puede eliminar una casa asignada a usuarios" });
    }

    const house = await House.findByIdAndDelete(req.params.id);

    if (!house) {
      return res.status(404).json({ message: "Casa no encontrada" });
    }

    res.json({ message: "Casa eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando casa", error: error.message });
  }
});

module.exports = router;
