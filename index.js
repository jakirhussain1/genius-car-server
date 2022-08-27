const express = require("express");
require('dotenv').config()
const app = express();
const jwt = require('jsonwebtoken');
const cors = require("cors");
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectID, ObjectId } = require("bson");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d2gwwqq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run (){
    client.connect();
    const dbcollection = client.db("genius-car").collection("services");
    const orderCollection = client.db("genius-car").collection("orders");
    app.post('/login',async(req,res)=>{
        const user = req.body;
        const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN,{
            expiresIn : '1d',
        })
        res.send(accessToken)
    })
    app.get("/services",async(req,res)=>{
        const query = {};
        const cursor = dbcollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })
    app.post("/order",async(req,res)=>{
        const newOrder = req.body;
        const insertOrder = await orderCollection.insertOne(newOrder);
        res.send(insertOrder); 
    })
 

    app.post("/add/services",async(req,res)=>{
        const newService = req.body;
        const addService = await dbcollection.insertOne(newService);
        res.send(addService);
    })
    app.delete("/service/:id",async(req,res)=>{
        const id = req.params.id;
        const deleteQuery = {_id:ObjectID(id)};
        const deleteSuccess = await dbcollection.deleteOne(deleteQuery);
        res.send(deleteSuccess);
    })
    app.get("/service/:id",async(req,res)=>{
        const editId = req.params.id;
        const editQuery = {_id: ObjectID(editId)};
        const resultEdit = await dbcollection.findOne(editQuery);
        res.send(resultEdit);
    })
    app.put("/service/:id",async(req,res)=>{
        const updateId = req.params.id;
        const updateUser = req.body;
        const filter = {_id:ObjectId(updateId)};
        const options = {upsert: true};
        const updateDoc = {
            $set: {
                name: updateUser.name,
                description: updateUser.description,
                img: updateUser.img,
            },
      
          };
          const updateResult = await dbcollection.updateOne(filter,updateDoc,options);
          res.send(updateResult);
    })
}
run().catch(console.dir);



app.get("/",(req,res)=>{
    res.send("Server started");
})
app.listen(port,()=>{
    console.log("Server running",port)
})