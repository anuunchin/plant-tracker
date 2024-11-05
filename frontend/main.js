async function fetchPlants() {
    const response = await fetch('http://localhost:3000/plants');
    const plants = await response.json();
    const plantList = document.getElementById('plant-list');
    plantList.innerHTML = '';
    plants.forEach((plant) => {
        const plantItem = document.createElement('div');
        plantItem.textContent = `${plant.name} - Last watered: ${plant.lastWatered}`;
        plantList.appendChild(plantItem);
    });
}

fetchPlants(); // Calls the function when the page loads

document.getElementById('plant-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevents the page from refreshing on form submission

    const plantName = document.getElementById('plant-name').value;
    const lastWatered = document.getElementById('last-watered').value;

    try {
        const response = await fetch('http://localhost:3000/plants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: plantName, lastWatered: lastWatered })
        });
        const newPlant = await response.json();
        
        // Add new plant to the list
        fetchPlants(); // Refresh the plant list
    } catch (error) {
        console.error('Error adding plant:', error);
    }
});

async function updatePlant(id, updatedData) {
    try {
        const response = await fetch(`http://localhost:3000/plants/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        const updatedPlant = await response.json();
        console.log('Plant updated:', updatedPlant);
        
        fetchPlants(); // Refresh the plant list
    } catch (error) {
        console.error('Error updating plant:', error);
    }
}

async function deletePlant(id) {
    try {
        await fetch(`http://localhost:3000/plants/${id}`, {
            method: 'DELETE'
        });
        
        fetchPlants(); // Refresh the plant list
    } catch (error) {
        console.error('Error deleting plant:', error);
    }
}
