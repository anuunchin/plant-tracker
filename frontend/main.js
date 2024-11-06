document.addEventListener("DOMContentLoaded", () => {
    const plantList = document.getElementById("plant-list");
    const plantForm = document.getElementById("plant-form");

    fetchPlants();

    plantForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const plantName = document.getElementById("plant-name").value;
        const lastWatered = document.getElementById("last-watered").value;

        try {
            const response = await fetch('http://localhost:3000/plants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: plantName, lastWatered: lastWatered })
            });
            const newPlant = await response.json();
            addPlantToDOM(newPlant);
            plantForm.reset();
        } catch (error) {
            console.error('Error adding plant:', error);
        }
    });

    async function fetchPlants() {
        try {
            const response = await fetch('http://localhost:3000/plants');
            const plants = await response.json();
            plantList.innerHTML = '';
            plants.forEach(addPlantToDOM); 
        } catch (error) {
            console.error('Error fetching plants:', error);
        }
    }

    function addPlantToDOM(plant) {
        const plantItem = document.createElement('div');
        plantItem.classList.add('plant-card');
        plantItem.setAttribute('data-id', plant.id); 

        plantItem.innerHTML = `
            <p><strong>${plant.name}</strong></p>
            <p>Last watered on: ${plant.lastWatered}</p>
            <button class="delete-plant">Delete</button>
        `;

        plantItem.querySelector('.delete-plant').addEventListener('click', async () => {
            await deletePlant(plant.id);
            plantItem.remove();
        });

        plantList.appendChild(plantItem); 
    }

    async function deletePlant(plantID) {
        try {
            const response = await fetch(`http://localhost:3000/plants/${plantID}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                console.error('Failed to delete plant');
            }
        } catch (error) {
            console.error('Error deleting plant:', error);
        }
    }
});
