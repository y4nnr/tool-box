import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Cart({ selectedSeats, onSeatsSelected }) {
    const [cart, setCart] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);
    
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
    <div className="cart-container" style={{ width: '100%', }}>
   
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
        <button className="" onClick={addToCart}>Add to Cart</button>
        <button className="" onClick={emptyCart}>Empty Cart</button>
    </div>
);

}

export default Cart;
