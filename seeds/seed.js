const mongoose = require("mongoose");
require("dotenv").config();

const House = require("../models/House");
const Wand = require("../models/Wand");

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("No se ha definido MONGODB_URI o MONGO_URI en el archivo .env");
    }

    await mongoose.connect(mongoUri);

    const housesData = [
      {
        name: "Gryffindor",
        founder: "Godric Gryffindor",
        colors: ["Scarlet", "Gold"],
        traits: ["Bravery", "Daring", "Chivalry"],
      },
      {
        name: "Slytherin",
        founder: "Salazar Slytherin",
        colors: ["Green", "Silver"],
        traits: ["Ambition", "Cunning", "Determination"],
      },
      {
        name: "Hufflepuff",
        founder: "Helga Hufflepuff",
        colors: ["Yellow", "Black"],
        traits: ["Loyalty", "Fairness", "Hard work"],
      },
      {
        name: "Ravenclaw",
        founder: "Rowena Ravenclaw",
        colors: ["Blue", "Bronze"],
        traits: ["Intelligence", "Creativity", "Wisdom"],
      },
    ];

    const wandsData = [
      { wood: "Holly", core: "Phoenix feather", length: 11 },
      { wood: "Oak", core: "Unicorn hair", length: 13 },
      { wood: "Willow", core: "Dragon heartstring", length: 10 },
      { wood: "Elder", core: "Thestral tail hair", length: 15 },
    ];

    await House.bulkWrite(
      housesData.map((house) => ({
        updateOne: {
          filter: { name: house.name },
          update: { $set: house },
          upsert: true,
        },
      }))
    );

    await Wand.bulkWrite(
      wandsData.map((wand) => ({
        updateOne: {
          filter: { wood: wand.wood, core: wand.core, length: wand.length },
          update: { $set: wand },
          upsert: true,
        },
      }))
    );

    const houses = await House.find().sort({ name: 1 });
    const wands = await Wand.find().sort({ wood: 1 });

    console.log("Seed completada:", {
      houses: houses.length,
      wands: wands.length,
    });
  } catch (error) {
    console.error("Error en la seed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedData();
