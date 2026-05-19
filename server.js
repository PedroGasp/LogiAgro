const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Permite que o Front-end acesse o Back-end

const db = mysql.createConnection({
    host: 'localhost',       // Mantém localhost porque o Node vai rodar dentro do servidor
    user: 'gps_user',
    password: '135Mudar.',
    database: 'gps_tracker'  // NOME CORRETO DO BANCO
});

// Rota que o seu Front-end vai chamar
app.get('/api/pontos', (req, res) => {
    // QUERY CORRIGIDA COM O NOME DA SUA TABELA
    db.query('SELECT id, device AS nome_ponto, latitude, longitude FROM gps_data', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results); // Envia os dados do MySQL formatados em JSON
    });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000 no Ubuntu!'));