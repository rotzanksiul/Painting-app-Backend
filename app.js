require('dotenv').config();

const express = require('express')
const app = express();
const mongoose = require('mongoose')
const cors = require('cors')
const collectionsRoutes = require('./routes/collections')
// Middleware to parse incoming JSON data
app.use(express.json());
// To make requests beween backend and frontend
app.use(cors())

//Connect to mongo
const dbURI = process.env.MONGO_CONNECTION

mongoose.connect(dbURI, { useNewUrlParser: true })
    .then(() => {
        console.info('connected to data base')
    })
    .catch((err) => {
        console.error('unable to connect to database' + err)
    })

app.use('/', collectionsRoutes)
//Port to listen

const PORT = 3001

app.listen(process.env.PORT || PORT, () => {
    console.info(`listening to port ${PORT}`)
})