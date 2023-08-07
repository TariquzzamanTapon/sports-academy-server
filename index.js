const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors')
require('dotenv').config();
var jwt = require('jsonwebtoken');
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



const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if(!authorization){
        return res.send({error : true, message : 'unauthorized access'})
    }

    // token come with (bearer token)
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.PRIVATE_KEY, function(err, decoded) {
        if(err){
            return res.send({error : true, message : 'unauthorized access'})
        }
        req.decoded = decoded;
        next ();
      });
}


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



        // make a token using jwt 
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.PRIVATE_KEY, {
                expiresIn: '1h'
            })
            res.send({ token })
        })

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
        app.post('/carts', async (req, res) => {
            const cartsItems = req.body;
            const result = await cartsCollection.insertOne(cartsItems);
            res.send(result);
        })

        // specific data find in database 
        app.get('/carts', verifyJWT, async (req, res) => {
            const email = req.query.email;
            console.log(email)
            if (!email) {
                res.send([])
            }
            if(email !== req.decoded.email){
                return res.send({error : true, message : 'unauthorized access'});
            }
            const query = { email: email };
            const result = await cartsCollection.find(query).toArray();
            res.send(result);

        })

        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await cartsCollection.deleteOne(query);
            res.send(result);
        })


        // save user information when user signup or social signup
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const query = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            }

            const result = await usersCollection.updateOne(query, updateDoc, options);
            res.send(result);
        })

        // get specific user from db
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })


        // make a admin role in user collection database 
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };

            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);

        })

        //  make a instructor role in user collection database 
        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'instructor'
                },
            };

            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })


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