import React, { useState, useEffect } from 'react';
import axios from 'axios';


const SeatingMap = ({ cart, onSeatsSelected }) => {
    const [bitmap, setBitmap] = useState(0);

// New state for showing or hiding the code
const [showCode, setShowCode] = useState(false);

// Function to toggle the visibility of the code block
const toggleCode = () => {
    setShowCode(prevState => !prevState);
}

    useEffect(() => {
        axios.get('http://localhost:3001/seating').then(response => {
            setBitmap(response.data.bitmap);
        });
    }, []);

    const toggleSeat = (seatIndex) => {
        const isSelected = (bitmap & (1 << seatIndex));
        const totalSelected = bitmap.toString(2).split('1').length - 1;

        // If trying to select a new seat while already having 4 selected
        if (!isSelected && totalSelected === 4) {
            alert("You can't select more than 4 seats!");
            return;
        }

        axios.post('http://localhost:3001/setSeat', { seatIndex }).then(response => {
            setBitmap(response.data.bitmap);
        }).catch(err => {
            if (err.response && err.response.data && err.response.data.error) {
                alert(err.response.data.error);
            } else {
                alert('An error occurred!');
            }
        });
    };

    const getSeatColor = (index) => {
        const isSelected = (bitmap & (1 << index));
        const totalSelected = bitmap.toString(2).split('1').length - 1;
    
        // Check if the seat is in the cart
        const seatName = `seat${index}`;
        if (cart && cart[seatName]) {
            return '💲';  // Dollar emoji for seats in the cart
        } else if (isSelected) {
            return '✅';  // Tick for selected seats
        } else if (totalSelected === 4) {
            return '🔒';  // Lock for unselected when 4 are selected
        } else {
            return '💺';  // Regular seat emoji
        }
    };

    const emptySelection = () => {
        // Let's assume your backend provides an API to set the entire bitmap to zeros.
        axios.post('http://localhost:3001/emptySelection').then(response => {
            setBitmap(0); // Set the local bitmap to zero.
        }).catch(err => {
            alert('An error occurred while emptying the selection!');
        });
    };
    
    

        // This function collects the selected seats and sends them to the cart.
        const handleAddToCart = () => {
            const selectedSeats = [];
            Array.from({ length: 16 }).forEach((_, index) => {
                if (bitmap & (1 << index)) {
                    selectedSeats.push(index);
                }
            });
    
            onSeatsSelected(selectedSeats);  // Notify parent component about the selected seats
        };
        console.log('Cart:', cart);

        return (
            <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {Array.from({ length: 16 }).map((_, index) => {
                        const seatIdentifier = `seat${index}`;
                        const isSeatInCart = cart && cart[seatIdentifier];
                        
                        return (
                            <button key={index} style={{ fontSize: '24px' }} onClick={() => toggleSeat(index)}>
                                {isSeatInCart ? '💵' : getSeatColor(index)}
                            </button>
                        );
                    })}
                </div>
                
                <div style={{ marginTop: '20px' }}>
                    {bitmap.toString(2).padStart(16, '0').split('').map((bit, index) => (
                        <span key={index} style={{ background: bit === '1' ? 'yellow' : 'white', padding: '5px', border: '1px solid black' }}>
                            {bit}
                        </span>
                    ))}
                </div>
        
                <div style={{ marginTop: '10px' }}>
                <button onClick={emptySelection}>Empty Selection</button>
            </div>
            
                {/* Show/Hide Code button */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
                    <button className="code-button" onClick={toggleCode} style={{ flex: 1 }}>
                        {showCode ? "Hide the Code" : "Show the Code"}
                    </button>
                </div>
        
                {showCode && (
                    <div className="code-container" style={{ marginTop: '10px', width: '100%' }}>
                        <pre>
                            <code style={{ marginTop: '10px', width: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                                {/* ... your existing code block here ... */}
                            </code>
                        </pre>
                    </div>
                )}
            </div>
        );
        
}

export default SeatingMap;