const fs = require("fs");
const path = require("path");

const dataFilePath = path.join(__dirname, "../data/plants.json");

function loadPlants() {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading plants.json:", err);
    return [];
  }
}

function savePlants(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving to plants.json:", err);
  }
}

module.exports = { loadPlants, savePlants };
