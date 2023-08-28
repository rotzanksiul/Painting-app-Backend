const express = require('express')
const app = express();
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config();
//Stripe payment
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
// Middleware to parse incoming JSON data
app.use(express.json());
// To make requests beween backend and frontend
app.use(cors())
//Importing the model
const Painting = require('./models/Painting')

//Connect to mongo
const dbURI = process.env.MONGO_CONNECTION

mongoose.connect(dbURI, { useNewUrlParser: true })
    .then(() => {
        console.log('connected to data base')
    })
    .catch((err) => {
        console.log('unable to connect to database' + err)
    })


const getPaintings = async (req, res) => {
    try {
        const painting = await Painting.find()
        res.status(200).json(painting)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

//Get requests
app.get('/', getPaintings)
//Popular paintings 
app.get('/popular', getPaintings)
//Bestdeals paintings 
app.get('/bestdeals', getPaintings)
//All collections
app.get('/allcollections', getPaintings)


//Getting one 
app.get('/allcollections/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const painting = await Painting.findById(id)

        if (!painting) {
            res.status(404).json({ message: 'Painting not found' })
        }

        res.status(200).json(painting)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Post request for Checkout using stripe
app.post('/checkout', async (req, res) => {
    try {
        //set up stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map((item) => {
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: item.name
                        },
                        unit_amount: Math.round(item.price * 100)  // to convert the price to cents
                    },

                    quantity: item.quantity
                }
            }),
            success_url: `${process.env.SERVER_URL}/success`,
            cancel_url: `${process.env.SERVER_URL}/cancel`

        })
        
        res.json({ url: session.url })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Creating one
// app.post('/', async (req, res)=>{
//     const painting = new Painting({
//         name: req.body.name,
//         artist: req.body.artist,
//         description: req.body.description,
//         price: req.body.price,
//         color: req.body.color,
//         quantity: req.body.quantity,
//         image_url: req.body.image_url,
//         style: req.body.style,
//         category: req.body.category
//     })

//     try {
//         const newPainting = await painting.save()
//         res.status(201).json(newPainting)
//     } catch (error) {
//         res.status(400).json({message: error.message})
//     }

// })



// port to listen

const PORT = 3001

app.listen(process.env.PORT || PORT, () => {
    console.log(`listening to port ${PORT}`)
})