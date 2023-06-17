const express = require('express');
const cors = require('cors')
require('dotenv').config();
// var jwt = require('jsonwebtoken');
const app = express();
const port = process.env.Port || 5000;

// MIDDLE_WARE 
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send("Summer school are running")
})


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fsoo8nr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,

});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect((err) => {
            if (err) {
                console.error(err);
                return;
            }
        })

        const popularClassesCollection = client.db("summerDB").collection("popularClasses");
        
        const instructorsCollection = client.db("summerDB").collection("popularInstructors");

        const userCollection = client.db("summerDB").collection("users");

        app.get('/popular', async (req, res) => {
            const cursor = popularClassesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get('/instructors', async (req, res) => {
            const cursor = instructorsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });


        // users
        app.post('/user', async (req, res) => {
            const users = req.body;
            const result = await userCollection.insertOne(users);
            res.send(result);
        });




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log("Summer school are running in the ", port)
})