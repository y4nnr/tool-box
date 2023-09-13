import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Cart.css';

const buttonStyle = {
    padding: '10px 15px',
    borderRadius: '5px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginRight: '10px'
};


const titleStyle = {
    borderBottom: '2px solid #3498db',
    paddingBottom: '10px',
    marginTop: '20px'
};

const buttonStyleCode = {
    padding: '10px 15px',
    borderRadius: '5px',
    backgroundColor: '#3a3a3a',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginRight: '10px'
};


function Cart({ selectedSeats, onSeatsSelected }) {
    const [cart, setCart] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);

// New state for showing or hiding the code
const [showCode, setShowCode] = useState(false);

// Function to toggle the visibility of the code block
const toggleCode = () => {
    setShowCode(prevState => !prevState);
}

    useEffect(() => {
        fetchCartData();
    }, []);

    const fetchCartData = async () => {
        try {
            const response = await axios.get('http://localhost:3001/fetchCartItems');
            if (response.data) {
                setCart(response.data);
                const total = Object.values(response.data).reduce((acc, curr) => acc + parseFloat(curr), 0);
                setTotalPrice(total);
            }
        } catch (error) {
            console.error("Error fetching cart data:", error);
        }
    };

    const addToCart = async () => {
        try {
            await axios.post('http://localhost:3001/addToCart', { seats: selectedSeats });
            fetchCartData();  // Refetch cart data after adding
            onSeatsSelected([]); // Clear the selected seats after adding to cart
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    };
    
    const removeFromCart = (seat) => {
        axios.post('http://localhost:3001/removeFromCart', { seat })
            .then(fetchCartData) // refresh the cart after removing a seat
            .catch(error => {
                console.error("Error removing from cart:", error);
            });
    };

    const emptyCart = () => {
        axios.post('http://localhost:3001/emptyCart')
            .then(response => {
                console.log(response.data);
                fetchCartData(); // refresh the cart after emptying it
            })
            .catch(error => {
                console.error("Error emptying the cart:", error);
            });
    };


    return (
        <div>
            <h3 style={titleStyle}>Your Cart </h3>
        <div className="cart-container" style={{ width: '100%', }}>
            <p className="cart-item">(Limited to 4 seats)</p>
              {/* Added styled header */}
            
            <ul>
                {
                    Object.entries(cart).map(([seat, price]) => {
                        const seatNumber = parseInt(seat.replace('seat', ''));
                        const formattedSeatNumber = seatNumber < 10 ? `0${seatNumber}` : seatNumber;
                        return (
                            <div key={seat} className="cart-item">
                                <span>Quantity 1 - Seat : {formattedSeatNumber} - Available for 1 movie - Price: {price} $ </span>
                                <button className="cart-button" onClick={() => removeFromCart(seat)}>Remove</button>
                            </div>
                        );
                    })
                }
            </ul>
            <div>
                Total Price: ${totalPrice.toFixed(2)}
            </div>
            <button style={buttonStyle} className="" onClick={addToCart}>Add to Cart</button>
            <button style={buttonStyle} className="" onClick={emptyCart}>Empty Cart</button>            
        </div>
                                {/* Show/Hide Code button */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <button className="code-button" onClick={toggleCode} style={buttonStyleCode}>
              {showCode ? "Hide the Code" : "Show the Code"}
          </button>
      </div>

      {showCode && (
    <div className="code-container" style={{ width: '100%', marginBottom: '20px', marginTop: '20px' }}>
        <pre style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', background: '#f7f7f7' }}>
            <code>
{`//////////////////////////////////////////////// Shopping Cart
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

        const selectedSeatNumbers = [];
        for (let i = 0; i < seats.length; i++) {
            if (seats[i] === "1") {
            }
        }

        // Check current length of the cart
        client.hlen('cart', (err, cartSize) => {
            if (err) {
                console.error('Error reading cart size:', err);
                return res.status(500).send('Server error.');
            }

            // Troubleshooting Step 1: Log intermediate values

            // Troubleshooting Step 2: Explicitly check for duplicates
            client.hmget('cart', selectedSeatNumbers, (err, existingSeatsInCart) => {
                if (err) {
                    console.error('Error checking for existing seats in cart:', err);
                    return res.status(500).send('Server error.');
                }

                // Adjust numSelectedSeats for seats already in the cart
                const newSeatsCount = existingSeatsInCart.filter(val => val === null).length;

               // Check if adding new seats will exceed the limit
                if (cartSize + newSeatsCount > 4) {
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
//////////////////////////////////////////////;`}
            </code>
        </pre>
    </div>
)}

        </div>
    );
}

export default Cart;
