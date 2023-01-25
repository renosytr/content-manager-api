const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

// allowing CORS in server
// const cors = require('cors');

// const corsOptions = {
//     origin: 'http://localhost:3000',
//     optionsSuccessStatus: 200 
// }

// app.use(cors(corsOptions));

const fs = require("fs");
const path = require("path");
const pathToFile = path.resolve("./data.json");

const getResources = () => JSON.parse(fs.readFileSync(pathToFile));

app.use(express.json());

app.get("/", (req, res)=>{
    res.send("hello world");
})

app.get("/api/active-resource", (req, res)=>{
    const resources =  getResources();
    const activeResource = resources.find(resource => resource.status === "active")
    res.send(activeResource);
})

app.get("/api/resources", (req, res)=>{
    const resources =  getResources();
    res.send(resources);
})

app.post("/api/resources", (req, res)=>{
    const resources =  getResources();
    const resource = req.body;

    resource.created_at = new Date();
    resource.status = "inactive";
    resource.id =  Date.now().toString();

    // write resources to data.json file
    resources.unshift(resource);
    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (err)=>{
        if(err){
            return res.status(422).send("Cannot store data in the file");
        }
        return res.send("Data has been saved!");
    })
})

app.get("/api/resources/:id", (req, res)=>{
    const resources =  getResources();
    const { id } = req.params;
    const resource = resources.find(resource => resource.id === id)
    res.send(resource);
})

app.patch("/api/resources/:id", (req, res)=>{
    const resources =  getResources();
    const { id } = req.params;
    const indexArray = resources.findIndex(resource => resource.id === id);
    const activeResource = resources.find(resource => resource.status === "active");

    resources[indexArray] = req.body;

    // active resourse related functionality
    if(req.body.status === "active"){
        if(activeResource){
            return res.status(422).send("There is active resource already");
        }

        resources[indexArray].status = "active";
        resources[indexArray].activationTime = new Date();
    }

    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (err)=>{
        if(err){
            return res.status(422).send("Cannot store data in the file");
        }
        return res.send("Data has been updated!");
    })
})

app.listen(PORT, ()=>{
    console.log("Server is listening on port:" + PORT);
})