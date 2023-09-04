const express = require('express');
const cors = require('cors');
const redis = require('ioredis');
const expressWs = require('express-ws');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const socketIo = require('socket.io');
const io = socketIo(server);
const axios = require('axios');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

const OPENWEATHER_API_KEY = '5b9b6efb168475e2f3664540adf20ba6';
const WEATHER_TTL = 600; // 10 minutes in seconds



expressWs(app); // This line is crucial
const PORT = 3001;

////////////////////////////////////////////// Connect to Redis on 127.0.0.1
const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379
});


// Manually define the RedisJSON commands for our redis client
client.json_set = function(key, path, json, callback) {
    client.send_command('JSON.SET', [key, path, json], callback);
  };
  client.json_get = function(key, path, callback) {
    client.send_command('JSON.GET', [key, path], callback);
  };
  
  const jsonSetAsync = promisify(client.json_set).bind(client);
  const jsonGetAsync = promisify(client.json_get).bind(client);
  const saddAsync = promisify(client.sadd).bind(client);
  const smembersAsync = promisify(client.smembers).bind(client);

// Create a new Redis client for monitoring
const redisClient = new redis();

// Price for a single seat
const SEAT_PRICE = 5;  // Assuming each seat costs $5
 


// Use body-parser to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());  // <-- Add this line to enable CORS for all routes

client.on('error', (err) => {
    console.error('Redis error:', err);
});

app.use(cors());
app.use(express.json());


////////////////////////////////////////////// String counter
// Fetch the counter value from Redis
app.get('/counter', (req, res) => {
    client.get('counter', (err, reply) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch counter' });
        res.json({ value: parseInt(reply || '0', 10) });
    });
});

// Increment the counter using Redis INCR
app.post('/increment', (req, res) => {
    client.incr('counter', (err, reply) => {
        if (err) return res.status(500).json({ error: 'Failed to increment counter' });
        res.json({ value: parseInt(reply, 10) });
    });
});

// Decrement the counter using Redis DECR
app.post('/decrement', (req, res) => {
    client.decr('counter', (err, reply) => {
        if (err) return res.status(500).json({ error: 'Failed to decrement counter' });
        res.json({ value: parseInt(reply, 10) });
    });
});

// Set counter value in Redis
app.post('/setCounter', (req, res) => {
    const value = req.body.value;
    client.set('counter', value, (err, reply) => {
        if (err) return res.status(500).json({ error: 'Failed to set counter' });
        res.json({ value: parseInt(value, 10) });
    });
});


////////////////////////////////////////////// Sorted Set counter
///Add Element to the Sorted Set
app.post('/addElement', (req, res) => {
    const { element, score } = req.body;
    client.zadd('sortedSet', score, element, (err, reply) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).send({ added: true });
    });
});

///Get All Elements from the Sorted Set
app.get('/getAllElements', (req, res) => {
    client.zrange('sortedSet', 0, -1, 'WITHSCORES', (err, elements) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        let result = [];
        for (let i = 0; i < elements.length; i += 2) {
            result.push({ element: elements[i], score: elements[i + 1] });
        }
        res.status(200).send(result);
    });
});

///Update Score of an Element
app.put('/updateScore', (req, res) => {
    const { element, newScore } = req.body;
    client.zadd('sortedSet', newScore, element, (err, reply) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).send({ updated: true });
    });
});

///Fetch Ranked Elements
app.get('/getRankedElements', (req, res) => {
    client.zrevrange('sortedSet', 0, -1, 'WITHSCORES', (err, elements) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        let result = [];
        for (let i = 0; i < elements.length; i += 2) {
            result.push({ element: elements[i], score: elements[i + 1] });
        }
        res.status(200).send(result);
    });
});

app.delete('/deleteElement', (req, res) => {
    const { element } = req.body;

    client.zrem('sortedSet', element, (err, response) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting element", error: err.message });
        }
        res.json({ message: "Element deleted successfully" });
    });
});


app.get('/getRanking', async (req, res) => {
    try {
        const ranking = await getRankingFromRedis();
        res.status(200).json(ranking);
    } catch (error) {
        console.error("Error:", error);  // This will print the error details in the backend console
        res.status(500).json({ message: "Error fetching ranking", error: error.message });
    }
    
});

const getRankingFromRedis = async () => {
    return new Promise((resolve, reject) => {
        client.zrevrange('sortedSet', 0, -1, 'WITHSCORES', (err, result) => {
            if (err) return reject(err);

            let ranking = [];
            for (let i = 0; i < result.length; i += 2) {
                ranking.push({
                    element: result[i],
                    score: result[i + 1]
                });
            }
            resolve(ranking);
        });
    });
};


////////////////////////////////////////////// Monitor
// Run Monitor from Redis
wss.on('connection', (ws) => {
    console.log('Client connected.');

    const redis = new Redis();

    redis.monitor((err, monitor) => {
        if (err) throw err;

        console.log('Connected to Redis.');

        monitor.on('monitor', (time, args, source, database) => {
            console.log(args);  // log monitored commands on server-side
            ws.send(JSON.stringify(args));  // send commands to frontend
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        redis.disconnect();
    });
});


////////////////////////////////////////////// API Caching OPENWEATHER

app.get('/weather', async (req, res) => {
    console.log("Received request for weather data.");
    const city = req.query.city || 'Seattle';

    if (req.query.source === 'true') {
        // Fetch directly from OpenWeather API without checking cache
        try {
            console.log("Fetching data directly from OpenWeather API...");
            let weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}`);
            
            // Update the cache for the city
            console.log("Updating cache for the city...");
            redisClient.setex(city, 300, JSON.stringify(weatherResponse.data));

            res.json(weatherResponse.data);
            return;
        } catch (error) {
            console.error("Failed to fetch from OpenWeather API:", error.message);
            res.status(500).json({ error: "Failed to fetch weather data" });
            return;
        }
    }

    // Check cache first
    redisClient.get(city, async (err, data) => {
        if (err) throw err;

        if (data !== null) {
            console.log("Serving data from cache.");
            res.json(JSON.parse(data));
        } else {
            try {
                console.log("Fetching data from OpenWeather API...");
                let weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}`);
                redisClient.setex(city, 300, JSON.stringify(weatherResponse.data));
                res.json(weatherResponse.data);
            } catch (error) {
                console.error("Failed to fetch from OpenWeather API:", error.message);
                res.status(500).json({ error: "Failed to fetch weather data" });
            }
        }
    });
});

app.delete('/cache', (req, res) => {
    const city = req.query.city;

    redisClient.del(city, (err, reply) => {
        if (err) {
            console.error("Error clearing cache:", err);
            res.status(500).json({ error: "Failed to clear cache" });
            return;
        }
        
        if (reply === 1) {
            console.log(`Cache for ${city} cleared`);
            res.json({ message: `Cache for ${city} cleared` });
        } else {
            console.log(`No cache found for ${city}`);
            res.status(404).json({ message: `No cache found for ${city}` });
        }
    });
});


////////////////////////////////////////////// Seating Map
// Get the bitmap representation
app.get('/seating', (req, res) => {
    client.get('seats', (err, reply) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch seats' });
        const bitmap = reply ? parseInt(reply, 2) : 0; // Convert binary string to integer
        res.json({ bitmap });
    });
});

// Set a seat or deselect
app.post('/setSeat', (req, res) => {
    const seatIndex = req.body.seatIndex;
    client.get('seats', (err, reply) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch seats' });
        let bitmap = reply ? parseInt(reply, 2) : 0;
        
        // Toggle the bit
        bitmap ^= (1 << seatIndex);
        
        // Check if the number of set bits exceeds 8
        if (bitmap.toString(2).split('1').length - 1 > 8) {
            return res.status(400).json({ error: 'Booking is limited to 8 seats maximum.' });
        }

        client.set('seats', bitmap.toString(2).padStart(16, '0'), (error) => {
            if (error) return res.status(500).json({ error: 'Failed to update seat' });
            res.json({ bitmap });
        });
    });
});

app.post('/emptySelection', (req, res) => {
    client.set('seats', '0000000000000000', (err) => {
        if (err) {
            res.status(500).json({ error: "Failed to reset the seats" });
        } else {
            res.json({ message: "Seats reset successfully" });
        }
    });
});


////////////////////////////////////////////// Shopping Cart
// ... (other imports and configurations)

app.post('/AddToCart', (req, res) => {
    // Fetch the seats from Redis
    client.get('seats', (err, seats) => {
        if (err) {
            console.error('Error reading seats from Redis:', err);
            return res.status(500).send('Server error.');
        }

        if (!seats) {
            return res.status(400).send('No seats selected.');
        }


        // Troubleshooting Step 3: Log the seats string
        console.log(`Seats from Redis: ${seats}`);

        const selectedSeatNumbers = [];
        for (let i = 0; i < seats.length; i++) {
            if (seats[i] === "1") {
                selectedSeatNumbers.push(`seat${i + 1}`);
            }
        }

        // Check current length of the cart
        client.hlen('cart', (err, cartSize) => {
            if (err) {
                console.error('Error reading cart size:', err);
                return res.status(500).send('Server error.');
            }

            // Troubleshooting Step 1: Log intermediate values
            console.log(`Cart size: ${cartSize}`);
            console.log(`Number of selected seats: ${selectedSeatNumbers.length}`);

            // Troubleshooting Step 2: Explicitly check for duplicates
            client.hmget('cart', selectedSeatNumbers, (err, existingSeatsInCart) => {
                if (err) {
                    console.error('Error checking for existing seats in cart:', err);
                    return res.status(500).send('Server error.');
                }

                // Adjust numSelectedSeats for seats already in the cart
                const newSeatsCount = existingSeatsInCart.filter(val => val === null).length;
                console.log(`Number of new seats to add: ${newSeatsCount}`);

               // Check if adding new seats will exceed the limit
                if (cartSize + newSeatsCount > 4) {
                    return res.status(400).send(`Seat limit exceeded. You currently have ${cartSize} seats in the cart and are trying to add ${newSeatsCount} more. You can only have up to 4 seats in the cart.`);
                }

                // Create the cart hash in Redis
                const multi = client.multi();
                selectedSeatNumbers.forEach(seatNum => {
                    multi.hset('cart', seatNum, SEAT_PRICE);
                });
                multi.exec(err => {
                    if (err) {
                        console.error('Error saving to cart:', err);
                        return res.status(500).send('Server error.');
                    }
                    res.status(200).send('Added to cart successfully.');
                });
            });
        });
    });
});




// ... (other code)

app.get('/fetchCartItems', (req, res) => {
    client.hgetall('cart', (err, cartItems) => {
        if (err) {
            console.error('Error fetching cart items:', err);
            return res.status(500).send('Server error.');
        }
        res.status(200).json(cartItems || {});
    });
});


app.post('/removeFromCart', (req, res) => {
    const seatNumber = req.body.seat;

    client.hdel('cart', seatNumber, (err, result) => {
        if (err) {
            console.error('Error removing seat from cart:', err);
            return res.status(500).send('Server error.');
        }
        if (result === 0) {
            return res.status(400).send('Seat not found in cart.');
        }
        res.status(200).send('Removed from cart successfully.');
    });
});


app.post('/emptyCart', (req, res) => {
    client.del('cart', (err, result) => {
        if (err) {
            console.error('Error emptying the cart:', err);
            return res.status(500).send('Server error.');
        }
        res.status(200).send('Cart emptied successfully.');
    });
});


////////////////////////////////////////////// Users

// Endpoint to create a user
app.post('/users', (req, res) => {
    const { username, firstName, lastName, premium, geo } = req.body;  // Updated destructuring
    const userId = uuidv4();

    client.json_set(userId, '.', JSON.stringify({ username, firstName, lastName, premium, geo }), (err) => {  // Updated JSON structure
        if (err) {
            console.error("Error storing user data in RedisJSON: ", err);
            return res.status(500).send(err.message);
        }

        client.sadd('users', userId, (err) => {
            if (err) {
                console.error("Error adding userId to Redis set: ", err);
                return res.status(500).send(err.message);
            }

            if (premium === "Yes") {
                client.sadd('user:premium', userId, (err) => {
                    if (err) {
                        console.error("Error adding userId to user:premium set: ", err);
                        return res.status(500).send(err.message);
                    }
                    res.status(200).send({ username, firstName, lastName, premium, geo, userId });
                });
            } else {
                res.status(200).send({ username, firstName, lastName, premium, geo, userId });
            }
        });
    });
});



app.get('/users', (req, res) => {
    client.smembers('users', (err, userIds) => {
        if (err) {
            console.error("Error fetching userIds from Redis set: ", err);
            return res.status(500).send(err.message);
        }

        if (userIds.length === 0) {
            return res.status(200).send([]);
        }

        const users = [];
        let pending = userIds.length;

        for (let userId of userIds) {
            client.json_get(userId, '.', (err, userJson) => {
                if (err) {
                    console.error("Error fetching user data from RedisJSON for userId:", userId, err);
                    return res.status(500).send(err.message);
                }

                console.log(`User data for ID ${userId}:`, userJson);  // Let's see what's being fetched

                const user = JSON.parse(userJson);
                
                if (user) {  // Check if user isn't null or undefined
                    user.userId = userId;
                    users.push(user);
                } else {
                    console.error(`Invalid user data for ID ${userId}`);
                }

                pending--;
                if (pending === 0) {
                    res.status(200).send(users);
                }
            });
        }
    });
});


app.get('/premiumUsers', (req, res) => {
    client.smembers('user:premium', (err, premiumUserIds) => {
        if (err) {
            console.error("Error fetching premium user IDs from Redis set: ", err);
            return res.status(500).send(err.message);
        }

        res.status(200).send(premiumUserIds);
    });
});


app.delete('/users/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Delete the user JSON object from Redis
        await client.del(userId);

        // Remove that user ID from the 'users' SET
        await client.srem('users', userId);

        // Remove that user ID from the 'user:online' SET (if it's there)
        await client.srem('user:online', userId);

        // Remove that user ID from the 'user:premium' SET (if it's there)
        await client.srem('user:premium', userId);

        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send({ error: 'Failed to delete user' });
    }
});



////////////////////////////////////////////// Intersections
// Get all users
app.get('/getUsers', (req, res) => {
    client.smembers('users', (err, userIds) => {
        if (err) {
            console.error('Error fetching user IDs from Redis:', err.message);
            return res.json({error: 'Failed to fetch users.'});
        }

        const usersPromises = userIds.map(id => {
            return new Promise((resolve, reject) => {
                client.send_command('JSON.GET', [id], (err, userJson) => {
                    if (err) return reject(err);
                    resolve(JSON.parse(userJson));
                });
            });
        });

        Promise.all(usersPromises)
            .then(users => res.json(users))
            .catch(err => {
                console.error('Error fetching user details from Redis:', err.message);
                return res.json({error: 'Failed to fetch users.'});
            });
    });
});



// Set user online
app.post('/userOnline', async (req, res) => {
    try {
        console.log("Received in /userOnline:", req.body);
        const { userId } = req.body; // Changed from username to userId
        if (!userId) {
            console.error('UserID not provided.');
            return res.status(400).json({ error: 'UserID not provided.' });
        }
        await client.sadd('user:online', userId); 
        res.json({ status: 'User set to online.' });
    } catch (error) {
        console.error('Failed to set user online:', error);
        res.status(500).json({ error: 'Failed to set user online.' });
    }
});


// Set user offline
app.post('/userOffline', async (req, res) => {
    try {
        const { userId } = req.body; // Changed from username to userId
        if (!userId) {
            console.error('UserID not provided.');
            return res.status(400).json({ error: 'UserID not provided.' });
        }
        await client.srem('user:online', userId);
        res.json({ status: 'User set to offline.' });
    } catch (error) {
        console.error('Error setting user offline:', error.message);
        res.status(500).json({error: 'Failed to set user offline.'});
    }
});



// Get all online users
app.get('/getOnlineUsers', (req, res) => {
    client.smembers('user:online', (err, onlineUserIds) => {
        if (err) {
            console.error('Error fetching online user IDs from Redis:', err.message);
            return res.status(500).json({ error: 'Failed to fetch online users.' });
        }
        // Here onlineUserIds will contain a list of userIds, not usernames.
        res.status(200).json(onlineUserIds);
    });
});


app.get('/getIntersectionUsers', (req, res) => {
    client.sinter('user:online', 'user:premium', (err, intersectionUsers) => {
        if (err) {
            console.error("Error fetching intersection users from Redis:", err);
            return res.status(500).send({ error: err.message });
        }

        res.status(200).send(intersectionUsers);
    });
});


////////////////////////////////////////////// 

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

