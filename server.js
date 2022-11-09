require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());


// Get all Restaurants
app.get('/api/v1/restaurants', async (req, res) => {
    try {
        // const results = await db.query('SELECT * FROM restaurants');
        // console.log(results);

        const restaurantRatingsData = await db.query('SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating), 1) AS average_rating FROM reviews GROUP BY restaurant_id) reviews ON restaurants.id = reviews.restaurant_id');
        // console.log(restaurantRatingsData);

        res.status(200).json({
            status: 'success',
            results: restaurantRatingsData.rowCount,
            data: {
                restaurants: restaurantRatingsData.rows
            }
        });
    }
    catch (error) {
        console.log(error);
    }
});


// Get a Restaurant
app.get('/api/v1/restaurants/:id', async (req, res) => {
    try {
        const restaurant = await db.query('SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating), 1) AS average_rating FROM reviews GROUP BY restaurant_id) reviews ON restaurants.id = reviews.restaurant_id WHERE id = $1', [req.params.id]);
        // console.log(restaurant);

        const reviews = await db.query('SELECT * FROM reviews WHERE restaurant_id = $1', [req.params.id]);

        res.status(200).json({
            status: 'success',
            data: {
                restaurant: restaurant.rows[0],
                reviews: reviews.rows
            }
        });
    }
    catch (error) {
        console.log(error);
    }
});


// Create a Restaurant
app.post('/api/v1/restaurants', async (req, res) => {
    const { name, location, price_range } = req.body;

    try {
        const results = await db.query('INSERT INTO restaurants (name, location, price_range) VALUES ($1, $2, $3) RETURNING *', [name, location, price_range]);
        // console.log(results);

        res.status(201).json({
            status: 'success',
            data: {
                restaurant: results.rows[0]
            }
        });
    }
    catch (error) {
        console.log(error);
    }
});


// Update a Restaurant
app.put('/api/v1/restaurants/:id', async (req, res) => {
    const { name, location, price_range } = req.body;
    try {
        const results = await db.query('UPDATE restaurants SET name = $1, location = $2, price_range = $3 WHERE id = $4 RETURNING *', [name, location, price_range, req.params.id]);
        console.log(results);

        res.status(200).json({
            status: 'success',
            data: {
                restaurant: results.rows[0]
            }
        });
    }
    catch (error) {
        console.log(error);
    }
});


// Delete a Restaurant
app.delete('/api/v1/restaurants/:id', async (req, res) => {
    try {
        const results = await db.query('DELETE FROM restaurants WHERE id = $1', [req.params.id]);

        res.status(204).json({
            status: 'success'
        });
    }
    catch (error) {
        console.log(error);
    }
});


// Add a Review
app.post('/api/v1/restaurants/:id/addReview', async (req, res) => {
    const { name, review, rating } = req.body;

    try {
        const newReview = await db.query('INSERT INTO reviews (restaurant_id, name, review, rating) VALUES ($1, $2, $3, $4) returning *', [req.params.id, name, review, rating]);

        res.status(201).json({
            status: 'success',
            data: {
                review: newReview.rows[0]
            }
        });
    }
    catch (error) {
        console.log(error);
    }
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})