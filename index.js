const { MongoClient, ServerApiVersion } = require('mongodb');
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
        const usersCollection = client.db("summerDB").collection("users");
        const classCollection = client.db('summerDB').collection('class');
        const cartsCollection = client.db('summerDB').collection('carts');

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

        // all class data here
        app.get('/class', async (req, res) => {
            const result = await classCollection.find().toArray();
            res.send(result);
        })

        // carts data adding here
        app.post('/carts', async(req, res)=>{
            const cartsItems = req.body;
            const result = await cartsCollection.insertOne(cartsItems);
            res.send(result);
        })

        // users
        app.post('/user', async (req, res) => {
            const users = req.body;
            const result = await usersCollection.insertOne(users);
            res.send(result);
        });


        // save user information when user signup or social signup
        // app.put('/user/:email', async (req, res)=>{
        //     const email = req.params.email;
        //     const user = req.body;
        //     const query = {email: email};
        //     const options ={upsert : true}
        //     const updateDoc = {
        //         $set : user
        //     }

        //     const result = await usersCollection.updateOne(query, updateDoc, options);
        //     res.send(result);
        // })







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