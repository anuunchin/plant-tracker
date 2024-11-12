const express = require("express");
const {
  getPlants,
  addPlant,
  archivePlant,
  unarchivePlant,
  updateLastWatered,
  deletePlant,
} = require("../controllers/plantsController");

const router = express.Router();

router.get("/plants", getPlants);
router.post("/plants", addPlant);
router.patch("/plants/:id/archive", archivePlant);
router.patch("/plants/:id/unarchive", unarchivePlant);
router.patch("/plants/:id/water", updateLastWatered);
router.delete("/plants/:id", deletePlant);

module.exports = router;
