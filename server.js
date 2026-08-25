const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const houseRoutes = require("./routes/houseRoutes");
const wandRoutes = require("./routes/wandRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    message: "API Hogwarts funcionando",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/wands", wandRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Error del servidor" });
});

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("No se ha definido JWT_SECRET en el archivo .env");
    }

    await connectDB();

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error.message);
    process.exit(1);
  }
};

startServer();
