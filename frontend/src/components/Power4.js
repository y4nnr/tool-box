import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';  // <-- Import FontAwesomeIcon
import { faUser } from '@fortawesome/free-solid-svg-icons';  // <-- Import the faUser icon

const Power4 = () => {
    const [currentPlayer, setCurrentPlayer] = useState('red');
    const [boardState, setBoardState] = useState(createEmptyBoard());
    const [redisString, setRedisString] = useState("");
    const [winningLine, setWinningLine] = useState([]);
    const [gameOver, setGameOver] = useState(false);

    const titleStyle = {
        borderBottom: '2px solid #3498db',
        paddingBottom: '10px',
        marginTop: '20px'
    };

    const buttonStyle = {
        padding: '10px 15px',
        borderRadius: '5px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        marginRight: '10px'
    };

    const styles = {
        board: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-start'
        },
        column: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer'
        }
    };
    

    function createEmptyBoard() {
        return Array(7).fill(Array(6).fill('empty'));
    }

    function isWinningMove(x, y) {
        return checkDirection(x, y, 0, 1) || // Vertical
               checkDirection(x, y, 1, 0) || // Horizontal
               checkDirection(x, y, 1, 1) || // Diagonal from top-left to bottom-right
               checkDirection(x, y, 1, -1);  // Diagonal from bottom-left to top-right
    }
    
    function checkDirection(x, y, deltaX, deltaY) {
        let count = 1;
        const tempWinningLine = [[x, y]];
    
        for (let i = 1; i < 4; i++) {
            const curX = x + i * deltaX;
            const curY = y + i * deltaY;
    
            if (curX >= 0 && curX < 7 && curY >= 0 && curY < 6 && boardState[curX][curY] === currentPlayer) {
                count++;
                tempWinningLine.push([curX, curY]);
            } else {
                break;
            }
        }
    
        for (let i = 1; i < 4; i++) {
            const curX = x - i * deltaX;
            const curY = y - i * deltaY;
    
            if (curX >= 0 && curX < 7 && curY >= 0 && curY < 6 && boardState[curX][curY] === currentPlayer) {
                count++;
                tempWinningLine.push([curX, curY]);
            } else {
                break;
            }
        }
    
        if (count >= 4) {
            setWinningLine(tempWinningLine);
            return true;
        } else {
            return false;
        }
    }
    

    function checkLine(x, y, deltaX, deltaY) {
        let count = 0;
        const tempWinningLine = [];
        let i = -3;

        while (i < 4) {
            const curX = x + i * deltaX;
            const curY = y + i * deltaY;
            if (curX >= 0 && curX < 7 && curY >= 0 && curY < 6 && boardState[curX][curY] === currentPlayer) {
                count++;
                tempWinningLine.push([curX, curY]);
            } else {
                count = 0;
                tempWinningLine.length = 0;
            }

            if (count === 4) {
                setWinningLine(tempWinningLine);
                return true;
            }
            i++;
        }
        return false;
    }

    useEffect(() => {
        async function fetchBoardState() {
            try {
                const response = await axios.get('http://localhost:3001/api/connect4/board');
                setBoardState(response.data);
            } catch (error) {
                console.error("Failed fetching board state:", error);
            }
        }

        fetchBoardState();
    }, []);

    async function dropCoin(column) {
        if (gameOver) return;

        try {
            const response = await axios.post('http://localhost:3001/api/connect4/dropCoin', { column, player: currentPlayer });
            if (response.data.success) {
                setBoardState(response.data.board);

                // Check for a win
                for (let row = 0; row < 6; row++) {
                    if (response.data.board[column][row] === currentPlayer) {
                        if (isWinningMove(column, row)) {
                            setGameOver(true);
                            return;
                        }
                        break;
                    }
                }

                setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
                setRedisString(JSON.stringify(response.data.board));
            } else {
                console.error(response.data.message);
            }
        } catch (error) {
            console.error("Failed dropping coin:", error);
        }
    }

    async function restartGame() {
        try {
            const response = await axios.post('http://localhost:3001/api/connect4/restart');
            if (response.data.success) {
                setBoardState(createEmptyBoard());
                setCurrentPlayer('red');
                setRedisString("");
                setWinningLine([]);
                setGameOver(false);
            } else {
                console.error(response.data.message);
            }
        } catch (error) {
            console.error("Failed restarting game:", error);
        }
    }

    const getSlotStyle = (slot, colIndex, rowIndex) => {
        let isWinningSlot = winningLine.some(([x, y]) => x === colIndex && y === rowIndex);
        return {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            margin: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isWinningSlot ? 'green' : slot === 'red' ? 'red' : slot === 'yellow' ? 'yellow' : 'white',
            border: '1px solid black'
        };
    };

    return (
        <div>
            <h3 style={titleStyle}>Click a Column to Drop a Coin</h3>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* Left Player Icon (Red) */}
                <i className="fa fa-user" style={{color: 'red', opacity: currentPlayer === 'red' ? 1 : 0.3}}></i>





                <div style={styles.board}>
                    {boardState.map((column, colIndex) => (
                        <div key={colIndex} style={styles.column} onClick={() => dropCoin(colIndex)}>
                            {column.map((slot, rowIndex) => (
                                <div key={rowIndex} style={getSlotStyle(slot, colIndex, rowIndex)}></div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Right Player Icon (Yellow) */}
                <i className="fa fa-user" style={{color: 'yellow', opacity: currentPlayer === 'yellow' ? 1 : 0.3}}></i>

            </div>

            <button onClick={restartGame} style={buttonStyle}>Restart Game</button>
        </div>
    );
};

export default Power4;