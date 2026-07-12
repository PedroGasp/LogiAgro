const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); 

const db = mysql.createConnection({
    host: 'localhost',       
    user: 'gps_user',
    password: '135Mudar.',
    database: 'gps_tracker'  
});

app.get('/api/pontos', (req, res) => {
    db.query('SELECT id, device AS nome_ponto, latitude, longitude FROM gps_data', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results); 
    });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000 no Ubuntu!'));