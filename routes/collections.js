const express = require('express')
const router = express.Router();
//Importing the model
const Painting = require('../models/Painting')
//Stripe payment
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


const getPaintings = async (req, res) => {
    try {
        const painting = await Painting.find()
        res.status(200).json(painting)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

//Get requests
router.get('/', getPaintings)
//Popular paintings 
router.get('/popular', getPaintings)
//Bestdeals paintings 
router.get('/bestdeals', getPaintings)
//All collections
router.get('/allcollections', getPaintings)


//Getting one 
router.get('/allcollections/:id', async (req, res) => {
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
router.post('/checkout', async (req, res) => {
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
// router.post('/', async (req, res)=>{
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

module.exports = router