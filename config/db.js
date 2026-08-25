const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("No se ha definido MONGODB_URI o MONGO_URI en el archivo .env");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB conectado correctamente");
};

module.exports = connectDB;
