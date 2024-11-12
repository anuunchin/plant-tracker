const { v4: uuidv4 } = require("uuid");
const { loadPlants, savePlants } = require("../utils/fileHelpers");

let plants = loadPlants();

const getPlants = (req, res) => {
  res.send(plants);
};

const addPlant = (req, res) => {
  const { name, lastWatered, wateringInterval } = req.body;

  if (!lastWatered || isNaN(Date.parse(lastWatered))) {
    return res
      .status(400)
      .send({ error: "Invalid or missing lastWatered date" });
  }

  if (!wateringInterval || isNaN(wateringInterval) || wateringInterval <= 0) {
    return res
      .status(400)
      .send({ error: "Invalid or missing watering interval" });
  }

  const plant = {
    name,
    lastWatered,
    id: uuidv4(),
    wateringHistory: [lastWatered],
    wateringInterval,
    isArchived: false,
  };

  plants.push(plant);
  savePlants(plants);

  res.status(201).send(plant);
};

const archivePlant = (req, res) => {
  const { id } = req.params;
  const plant = plants.find((p) => p.id === id);
  if (plant) {
    plant.isArchived = true;
    savePlants(plants);
    res.send(plant);
  } else {
    res.status(404).send({ message: "Plant not found" });
  }
};

const unarchivePlant = (req, res) => {
  const { id } = req.params;
  const plant = plants.find((p) => p.id === id);
  if (plant) {
    plant.isArchived = false;
    savePlants(plants);
    res.send(plant);
  } else {
    res.status(404).send({ message: "Plant not found" });
  }
};

const updateLastWatered = (req, res) => {
  const { id } = req.params;
  const { lastWateredDate, force } = req.body;

  const plant = plants.find((p) => p.id === id);
  if (plant) {
    if (!lastWateredDate || isNaN(Date.parse(lastWateredDate))) {
      return res
        .status(400)
        .send({ error: "Invalid or missing watered date." });
    }

    const lastRecordedDate = new Date(plant.lastWatered);
    const newDate = new Date(lastWateredDate);

    if (!force && newDate < lastRecordedDate) {
      return res.status(409).send({
        message: `The date entered is earlier than the last watered date (${plant.lastWatered}).`,
        lastWatered: plant.lastWatered,
      });
    }

    if (newDate > lastRecordedDate) {
      plant.lastWatered = lastWateredDate;
    }
    plant.wateringHistory.push(lastWateredDate);
    plant.wateringHistory.sort((a, b) => new Date(b) - new Date(a));

    savePlants(plants);
    res.send(plant);
  } else {
    res.status(400).send({ error: "No such plant found." });
  }
};

const deletePlant = (req, res) => {
  const { id } = req.params;
  plants = plants.filter((p) => p.id !== id);
  savePlants(plants);
  res.status(204).send();
};

module.exports = {
  getPlants,
  addPlant,
  archivePlant,
  unarchivePlant,
  updateLastWatered,
  deletePlant,
};
