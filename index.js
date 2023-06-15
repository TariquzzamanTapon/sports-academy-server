const express = require('express');
const cors = require('cors')
require('dotenv').config();
// var jwt = require('jsonwebtoken');
const app = express();
const port = process.env.Port || 5000;

// MIDDLE_WARE 
app.use(cors());
app.use(express.json());


app.get('/', (req, res)=>{
    res.send("Summer school are running")
})

app.listen(port,()=>{
    console.log("Summer school are running in the ", port)
} )