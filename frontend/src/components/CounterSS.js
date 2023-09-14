import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CounterSS() {
    const [rankingData, setRankingData] = useState([]);
    const [element, setElement] = useState('');
    const [score, setScore] = useState('');
    const [selectedElement, setSelectedElement] = useState('');
    const [selectedElementScore, setSelectedElementScore] = useState('');
    const [elements, setElements] = useState([]);

    useEffect(() => {
        fetchElements();
        fetchRanking();  // Add this line
    }, []);
    
// New state for showing or hiding the code
const [showCode, setShowCode] = useState(false);

// Function to toggle the visibility of the code block
const toggleCode = () => {
    setShowCode(prevState => !prevState);
}


    const fetchElements = async () => {
        try {
            const response = await axios.get('http://localhost:3001/getAllElements');
            setElements(response.data);
        } catch (error) {
            console.error("Error fetching elements", error);
        }
    };

    const fetchRanking = async () => {
        try {
            const response = await axios.get('http://localhost:3001/getRanking');
            setRankingData(response.data);
        } catch (error) {
            console.error("Error fetching ranking", error);
        }
    };


    const addElementHandler = async () => {
        try {
            await axios.post('http://localhost:3001/addElement', { element, score });
            fetchElements();
            fetchRanking();  // Add this line
            setElement('');
            setScore('');
        } catch (error) {
            console.error("Error adding element", error);
        }
    };

    const [elementToDelete, setElementToDelete] = useState('');

    const deleteElementHandler = async () => {
        try {
            await axios.delete('http://localhost:3001/deleteElement', { data: { element: elementToDelete } });
            fetchElements();
            fetchRanking();
            setElementToDelete('');
        } catch (error) {
            console.error("Error deleting element", error);
        }
    };

    
    const updateScoreHandler = async () => {
        try {
            await axios.put('http://localhost:3001/updateScore', { element: selectedElement, newScore: selectedElementScore });
            fetchElements();
            fetchRanking();  // Add this line
            setSelectedElement('');
            setSelectedElementScore('');
        } catch (error) {
            console.error("Error updating score", error);
        }
    };

   // New styles
   const inputStyle = {
    padding: '10px',
    borderRadius: '5px',
    margin: '0 10px 20px 0',
    fontSize: '18px',
    width: 'calc(50% - 10px)'
};

const buttonStyle = {
    padding: '10px 15px',
    borderRadius: '5px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
};

const buttonStyleCode = {
    padding: '5px 4px',
    borderRadius: '5px',
    backgroundColor: '#3a3a3a',
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

return (
    <div>
        <h3 style={titleStyle}>Add Element to Sorted Set</h3>
        <div>
            <input style={inputStyle} value={element} onChange={(e) => setElement(e.target.value)} placeholder="Enter element" />
            <input style={{ ...inputStyle, width: 'calc(40% - 10px)' }} type="number" value={score} onChange={(e) => setScore(e.target.value)} placeholder="Enter score" />
            <button style={buttonStyle} onClick={addElementHandler}>Add Element</button>
        </div>

        <h3 style={titleStyle}>Update Score of an Element</h3>
        <div>
            <select style={inputStyle} value={selectedElement} onChange={(e) => {
                setSelectedElement(e.target.value);
                const matchedElement = elements.find(el => el.element === e.target.value);
                if (matchedElement) {
                    setSelectedElementScore(matchedElement.score);
                }
            }}>
                <option value="">Select an element</option>
                {elements.map(el => <option key={el.element} value={el.element}>{el.element}</option>)}
            </select>
            <input style={{ ...inputStyle, width: 'calc(40% - 10px)' }} type="number" value={selectedElementScore} onChange={(e) => setSelectedElementScore(e.target.value)} placeholder="Enter new score" />
            <button style={buttonStyle} onClick={updateScoreHandler}>Update Score</button>
        </div>

        <h3 style={titleStyle}>Delete an Element</h3>
        <div>
            <select style={inputStyle} value={elementToDelete} onChange={(e) => setElementToDelete(e.target.value)}>
                <option value="">Select an element to delete</option>
                {elements.map(el => <option key={el.element} value={el.element}>{el.element}</option>)}
            </select>
            <button style={buttonStyle} onClick={deleteElementHandler}>Delete</button>
        </div>

        <h3 style={titleStyle}>Elements Ranked by Score</h3>
        <table className="ranking-table" style={{ width: '100%'}} >
    <thead>
        <tr>
            <th style={{ fontSize: '20px'}}>Rank</th>
            <th style={{ fontSize: '20px'}}>Element</th>
            <th style={{ fontSize: '20px'}}>Score</th>
        </tr>
    </thead>
    <tbody>
        {rankingData.map((data, index) => (
            <tr key={index}>
                <td style={{ fontSize: '20px'}}>{index + 1}</td>
                <td style={{ fontSize: '20px'}}>{data.element}</td>
                <td style={{ fontSize: '20px'}}>{data.score}</td>
            </tr>
        ))}
    </tbody>
</table>

      {/* Show/Hide Code button */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'right', marginBottom: '1px'}}>
          <button className="code-button" onClick={toggleCode} style={buttonStyleCode}>
          {showCode ? <i class="fa fa-code-fork fa-sm"></i> : <i class="fa fa-code-fork fa-sm"></i>}
          </button>
      </div>

      {showCode && (
    <div className="code-container" style={{ width: '100%', marginBottom: '20px', marginTop: '20px' }}>
        <pre style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', background: '#f7f7f7' }}>
            <code>
{`//////////////////////////////////////////////// Sorted Set counter
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


//////////////////////////////////////////////`}
            </code>
        </pre>
    </div>
)}


  </div>
);

}


export default CounterSS;