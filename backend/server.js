const express = require("express");                 //imports express
const {v4: uuidv4 } = require("uuid");
const app = express()                               //creates express app
const PORT = 3000;                                  ///middleware func that processes requests before they reach route handlers

app.use(express.json());                            //converts incoming json data to js objects

app.listen(PORT, () => {                            //() => { ... } is a callback on successful start
    console.log(`Server is running on http://localhost:${PORT}`)
});

let plants = [];                

app.post('/plants', (req, res) => {                 //handles POST requests to the /plants endpoint
    const { name, lastWatered} = req.body;

    if (!lastWatered || isNaN(Date.parse(lastWatered))) {
        return res.status(400).send({ error: 'Invalid or missing lastWatered date' });
    }

    const plant = { name, lastWatered, id: uuidv4(), wateringHistory: [lastWatered]}; 
    plants.push(plant);                             //equals to append in Python
    res.status(201).send(plant);                    //sends success status with plant object
});

app.patch('/plants/:id/water', (req, res) => {
    //TODO
    const {id} = req.params;
    const {lastWateredDate, force} = req.body;

    let plant = plants.find((p) => p.id === id);
    if (plant) {
        if (!lastWateredDate || isNaN(Date.parse(lastWateredDate))) {
            return res.status(400).send({error: 'Invalid or missing watered date.'})
        }
        
        const lastRecordedDate = new Date(plant.lastWatered);
        const newDate = new Date(lastWateredDate);

        if (!force && newDate < lastRecordedDate) {
            return res.status(409).send({
                message: `The date entered is earlier than the last watered date (${plant.lastWatered}).`,
                lastWatered: plant.lastWatered
            });
        }

        // Only update lastWatered if the new date is more recent (there could be some backfilling happening)
        if (newDate > lastRecordedDate) {
            plant.lastWatered = lastWateredDate;
        }
        plant.wateringHistory.push(lastWateredDate);
        // Order list so that history looks clean
        plant.wateringHistory.sort((a,b) => new Date(b) - new Date(a));
        res.send(plant);
    } else {
        return res.status(400).send({error: 'No such plant found.'})
    }
})

app.get('/plants', (req, res) => {                  //handles GET requests
    res.send(plants);                               //just sends all plants 
});

app.put('/plants/:id', (req, res) => {              //handles PUT requests based on plant id
    const { id } = req.params;
    const updatedData = req.body;
    let plant = plants.find((p) => p.id === id);    //uses arrow func to find plant with id (works like Python list comprehension)
    if (plant) {
        Object.assign(plant, updatedData);          
        res.send(plant);
    } else {
        res.status(404).send({ message: 'Plant not found' });
    }
});

app.delete('/plants/:id', (req, res) => {           //handles DELETE requests based on plant id
    const { id } = req.params;
    plants = plants.filter((p) => p.id !== id);     //compared to find, returns all matching objects
    res.status(204).send(); 
});

app.use(express.static('frontend'));
