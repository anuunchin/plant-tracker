document.addEventListener("DOMContentLoaded", () => {
    const plantForm = document.getElementById("plant-form");

    fetchPlants();

    plantForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const plantName = document.getElementById("plant-name").value;
        const lastWatered = document.getElementById("last-watered").value;
        const wateringInterval = parseInt(document.getElementById("watering-interval").value, 10);


        console.log('Adding new plant...');

        try {
            const response = await fetch('http://localhost:3000/plants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: plantName, lastWatered: lastWatered, wateringInterval })
            });
            const newPlant = await response.json();
            addPlantToDOM(newPlant);
            plantForm.reset();
            console.log('New plant added.');

            const globalNotification = document.getElementById('global-notification');

            if (globalNotification) {
                globalNotification.textContent = 'New plant! 🌼'
                globalNotification.style.opacity = '1';
                console.log('Notification triggered and styles set to force visibility');
            } else {
                console.error('Notification element not found');
            }

            setTimeout(() => {
                if (globalNotification) {
                    globalNotification.style.opacity = '0'; 
                }
            }, 1500);

        } catch (error) {
            console.error('Error adding plant:', error);
        }

        await fetchPlants(); 

    });

    async function fetchPlants() {
        try {
            const response = await fetch('http://localhost:3000/plants');
            const plants = await response.json();

            const today = new Date();

            document.getElementById('immediate-watering').innerHTML = '';
            document.getElementById('soon-watering').innerHTML = '';
            document.getElementById('not-urgent-watering').innerHTML = '';    

            plants.forEach(plant => {
                const nextWateringDate = new Date(plant.lastWatered);
                nextWateringDate.setDate(nextWateringDate.getDate() + plant.wateringInterval);
                const daysUntilNextWatering = (nextWateringDate - today) / (1000 * 60 * 60 * 24);
    
                if (daysUntilNextWatering <= 0) {
                    addPlantToDOM(plant, 'immediate-watering', '#FDDFDF');
                } else if (daysUntilNextWatering <= 2) {
                    addPlantToDOM(plant, 'soon-watering', '#FCF7DE');
                } else {
                    addPlantToDOM(plant, 'not-urgent-watering', '#DEFDE0');
                }
            });
        } catch (error) {
            console.error('Error fetching plants:', error);
        }
    }

    function addPlantToDOM(plant, containerId, backgroundColor) { //DOM = Document Object Model
        const plantItem = document.createElement('div');
        plantItem.classList.add('plant-card');
        plantItem.setAttribute('data-id', plant.id); 
        plantItem.style.backgroundColor = backgroundColor;

//        const backgroundColors = ['#FDDFDF', '#FCF7DE', '#DEFDE0', '#DEF3FD', '#F0DEFD', '#eceae4'];
//        const colorIndex = hashStringToIndex(plant.id, backgroundColors.length);
//        const assignedColor = backgroundColors[colorIndex];
//        plantItem.style.backgroundColor = assignedColor;
    
        plantItem.innerHTML = `

            <p class="plant-title">${plant.name}</p>

            <p class="last-watered-text">Last watered on:</p>
            <p class="last-watered-date">${plant.lastWatered}</p>

            <p class="watering-interval-text">Watering interval:</p>
            <p class="watering-interval">${plant.wateringInterval} days</p>

            <h4 class="watering-history-text">Watering History:</h4>
            <div class="watering-history">
                ${plant.wateringHistory.map(date => `<p>${date}</p>`).join('')} 
            </div>
            <h4 class="water-title">Add new watering day:</h4>
            <input type="date" class="update-watered-date" max="${new Date().toISOString().split('T')[0]}" />
            <button class="update-plant">Track</button>
            <div class="notification">This message will be customized in the respective handler.</div>

            <!-- Settings icon with dropdown menu -->
            <div class="settings">
                <span class="settings-icon">&#9881;</span> <!-- Unicode for a gear icon -->
                <div class="dropdown-menu">
                    <button class="delete-plant">Delete</button>
                </div>
            </div>
            `;

        plantItem.querySelector('.settings-icon').addEventListener('click', () => {
            const dropdownMenu = plantItem.querySelector('.dropdown-menu');
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });

        plantItem.querySelector('.delete-plant').addEventListener('click', async () => {
            const globalNotification = document.getElementById('global-notification');

            await deletePlant(plant.id);

            plantItem.remove();

            const notification = plantItem.querySelector('.notification');

            if (globalNotification) {
                globalNotification.textContent = 'Plant removed. ❌'
                globalNotification.style.opacity = '1';
                console.log('Notification triggered and styles set to force visibility');
            } else {
                console.error('Notification element not found');
            }

            setTimeout(() => {
                if (globalNotification) {
                    globalNotification.style.opacity = '0'; 
                }
            }, 1500);
        });

        plantItem.querySelector('.update-plant').addEventListener('click', async () => {
            const updatedDate = plantItem.querySelector('.update-watered-date').value;
            if (updatedDate) {
                await updateLastWatered(plant.id, updatedDate);
                fetchPlants();
                const globalNotification = document.getElementById('global-notification');

                if (globalNotification) {
                    globalNotification.textContent = 'Successfully tracked! 💦'
                    globalNotification.style.opacity = '1';
                    console.log('Notification triggered and styles set to force visibility');
                } else {
                    console.error('Notification element not found');
                }

                setTimeout(() => {
                    if (globalNotification) {
                        globalNotification.style.opacity = '0'; 
                    }
                }, 1500);
            }
        })

        document.getElementById(containerId).appendChild(plantItem);

//        plantList.appendChild(plantItem); 
    }

    function hashStringToIndex(string, max) {
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = (hash << 5) - hash + string.charCodeAt(i);
            hash = hash & hash; 
        }
        return Math.abs(hash % max);
    }

    async function deletePlant(plantID) {
        try {
            const response = await fetch(`http://localhost:3000/plants/${plantID}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                console.error('Failed to delete plant');
            }

            await fetchPlants();
            
        } catch (error) {
            console.error('Error deleting plant:', error);
        }
    }

    async function updateLastWatered(plantId, lastWateredDate, force = false) {
        try {
            const response = await fetch(`http://localhost:3000/plants/${plantId}/water`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({lastWateredDate, force})
            })

            if (response.status == 409) {
                const data = await response.json();
                const confirmUpdate = confirm(
                    `Are you sure about this date? ${data.message} Proceed only if you're backfilling previous watered dates.`
                );
                if (confirmUpdate) {
                    await updateLastWatered(plantId, lastWateredDate, true);
                }
            } else if (!response.ok) {
                console.error('Failed to update plant');
            }

            await fetchPlants();

        } catch (error) {
            console.error('Could not update last watered day of plant:', error)
        }
    }

});
