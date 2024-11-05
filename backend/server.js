const express = require("express");                 //imports express
const app = express()                               //creates express app
const PORT = 3000;                                  ///middleware func that processes requests before they reach route handlers

app.use(express.json());                            //converts incoming json data to js objects

app.listen(PORT, () => {                            //() => { ... } is a callback on successful start
    console.log(`Server is running on http://localhost:${PORT}`)
});

let plants = [];                

app.post('/plants', (req, res) => {                 //handles POST requests to the /plants endpoint
    const plant = req.body;
    plants.push(plant);                             //equals to append in Python
    res.status(201).send(plant);                    //sends success status with plant object
});

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
