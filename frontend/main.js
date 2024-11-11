document.addEventListener("DOMContentLoaded", () => {
  const plantForm = document.getElementById("plant-form");

  fetchPlants();

  plantForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const plantName = document.getElementById("plant-name").value;
    const lastWatered = document.getElementById("last-watered").value;
    const wateringInterval = parseInt(
      document.getElementById("watering-interval").value,
      10,
    );

    console.log("Adding new plant...");

    try {
      const response = await fetch("http://localhost:3000/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: plantName,
          lastWatered: lastWatered,
          wateringInterval,
        }),
      });
      const newPlant = await response.json();

      addPlantToDOM(newPlant);

      plantForm.reset();

      console.log("New plant added.");

      showNotification("New plant! 🌼");
    } catch (error) {
      console.error("Error adding plant:", error);
    }

    await fetchPlants();
  });

  function addPlantToDOM(plant) {
    let containerId;
    let backgroundColor;

    if (plant.isArchived) {
      containerId = "archived-plants";
      backgroundColor = "#eceae4";
    } else {
      const today = new Date();

      const nextWateringDate = new Date(plant.lastWatered);
      nextWateringDate.setDate(
        nextWateringDate.getDate() + plant.wateringInterval,
      );
      const daysUntilNextWatering =
        (nextWateringDate - today) / (1000 * 60 * 60 * 24);

      if (daysUntilNextWatering <= 0) {
        containerId = "immediate-watering";
        backgroundColor = "#FDDFDF";
      } else if (daysUntilNextWatering <= 2) {
        containerId = "soon-watering";
        backgroundColor = "#FCF7DE";
      } else {
        containerId = "not-urgent-watering";
        backgroundColor = "#DEFDE0";
      }
    }

    const plantItem = document.createElement("div");
    plantItem.classList.add("plant-card");
    plantItem.setAttribute("data-id", plant.id);
    plantItem.style.backgroundColor = backgroundColor;

    plantItem.innerHTML = `

            <p class="plant-title">${plant.name}</p>

            <p class="last-watered-text">Last watered on:</p>
            <p class="last-watered-date">${plant.lastWatered}</p>

            <p class="watering-interval-text">Watering interval:</p>
            <p class="watering-interval">${plant.wateringInterval} days</p>

            <h4 class="watering-history-text">Watering History:</h4>
            <div class="watering-history">
                ${plant.wateringHistory.map((date) => `<p>${date}</p>`).join("")} 
            </div>
        
            <div class="notification">This message will be customized in the respective handler.</div>

            ${
              plant.isArchived
                ? ""
                : `<h4 class="water-title">Add new watering day:</h4>
            <input type="date" class="update-watered-date" max="${new Date().toISOString().split("T")[0]}" />
            <button class="update-plant">Track</button>`
            }
            <div class="settings">
              <span class="settings-icon">&#9881;</span>
              <div class="dropdown-menu">
                <button class="delete-button">Delete</button>
                ${plant.isArchived ? `<button class="unarchive-button">Unarchive</button>` : `<button class="archive-button">Archive</button>`}
              </div>
            </div>
          `;

    const settingsIcon = plantItem.querySelector(".settings-icon");
    if (settingsIcon) {
      settingsIcon.addEventListener("click", () => {
        const dropdownMenu = plantItem.querySelector(".dropdown-menu");
        dropdownMenu.style.display =
          dropdownMenu.style.display === "block" ? "none" : "block";
      });
    }

    const archiveButton = plantItem.querySelector(".archive-button");
    if (archiveButton) {
      archiveButton.addEventListener("click", async () => {
        await archivePlant(plant.id);
        await fetchPlants();
        showNotification("Plant archived. 🗃️");
      });
    }

    const unArchiveButton = plantItem.querySelector(".unarchive-button");
    if (unArchiveButton) {
      unArchiveButton.addEventListener("click", async () => {
        await unarchivePlant(plant.id);
        await fetchPlants();
        showNotification("Plant unarchived. 📖");
      });
    }

    const delButton = plantItem.querySelector(".delete-button");
    if (delButton) {
      delButton.addEventListener("click", async () => {
        await deletePlant(plant.id);
        plantItem.remove();
        await fetchPlants();
        showNotification("Plant removed. ❌");
      });
    }

    const updateButton = plantItem.querySelector(".update-plant");
    if (updateButton) {
      updateButton.addEventListener("click", async () => {
        const updatedDate = plantItem.querySelector(
          ".update-watered-date",
        ).value;
        if (updatedDate) {
          await updateLastWatered(plant.id, updatedDate);
          await fetchPlants();
          showNotification("Successfully tracked! 💦");
        }
      });
    }

    document.getElementById(containerId).appendChild(plantItem);
  }

  async function fetchPlants() {
    try {
      const response = await fetch("http://localhost:3000/plants");
      const plants = await response.json();

      document.getElementById("immediate-watering").innerHTML = "";
      document.getElementById("soon-watering").innerHTML = "";
      document.getElementById("not-urgent-watering").innerHTML = "";
      document.getElementById("archived-plants").innerHTML = "";

      plants.forEach((plant) => {
        addPlantToDOM(plant);
      });
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  }

  async function archivePlant(plantID) {
    try {
      const response = await fetch(
        `http://localhost:3000/plants/${plantID}/archive`,
        {
          method: "PATCH",
        },
      );
      if (!response.ok) {
        console.error("Failed to archive plant");
      }
    } catch (error) {
      console.error("Error archiving plant:", error);
    }
  }

  async function unarchivePlant(plantID) {
    try {
      const response = await fetch(
        `http://localhost:3000/plants/${plantID}/unarchive`,
        {
          method: "PATCH",
        },
      );
      if (!response.ok) {
        console.error("Failed to unarchive plant");
      }
    } catch (error) {
      console.error("Error unarchiving plant:", error);
    }
  }

  async function deletePlant(plantID) {
    try {
      const response = await fetch(`http://localhost:3000/plants/${plantID}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        console.error("Failed to delete plant");
      }
    } catch (error) {
      console.error("Error deleting plant:", error);
    }
  }

  async function updateLastWatered(plantId, lastWateredDate, force = false) {
    try {
      const response = await fetch(
        `http://localhost:3000/plants/${plantId}/water`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lastWateredDate, force }),
        },
      );

      if (response.status == 409) {
        const data = await response.json();
        const confirmUpdate = confirm(
          `Are you sure about this date? ${data.message} Proceed only if you're backfilling previous watered dates.`,
        );
        if (confirmUpdate) {
          await updateLastWatered(plantId, lastWateredDate, true);
        }
      } else if (!response.ok) {
        console.error("Failed to update plant");
      }
    } catch (error) {
      console.error("Could not update last watered day of plant:", error);
    }
  }

  function showNotification(message) {
    const globalNotification = document.getElementById("global-notification");

    if (globalNotification) {
      globalNotification.textContent = message;
      globalNotification.style.opacity = "1";
      console.log("Notification triggered and styles set to force visibility");

      setTimeout(() => {
        globalNotification.style.opacity = "0";
      }, 1500);
    } else {
      console.error("Notification element not found");
    }
  }
});
