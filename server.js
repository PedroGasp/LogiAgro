const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const db = mysql.createConnection({
      host: 'logi-agro-logi-agro.e.aivencloud.com',
      port: 18468,
      user: 'avnadmin',
      password:'AVNS_wV2j5fNxZiic2DBh_3o',
      database:'gps_user',
      ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'ca.pem')),
        rejectUnauthorized: true // Set to false only if using self-signed certs without strict verification
      }
    });

app.get('/api/pontos', (req, res) => {
    db.query('SELECT id, device AS nome_ponto, latitude, longitude FROM gps_data', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/api/bezerros', (req, res) => {
    const query = 'SELECT id, nome, raca, peso, idade, imagem_base64, vendido, doente FROM bezerros ORDER BY id DESC';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const bezerros = (results || []).map(item => ({
            ...item,
            vendido: Number(item.vendido) || 0,
            doente: Number(item.doente) || 0,
            peso: Number(item.peso)
        }));

        res.json(bezerros);
    });
});

app.post('/api/bezerros', (req, res) => {
    const { nome, raca, peso, idade, imagem_base64, vendido = 0, doente = 0 } = req.body;

    if (!nome || !raca || !peso || !idade) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const query = 'INSERT INTO bezerros (nome, raca, peso, idade, imagem_base64, vendido, doente) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [nome, raca, peso, idade, imagem_base64 || null, Number(vendido), Number(doente)];

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId, message: 'Bezerro cadastrado com sucesso.' });
    });
});

app.put('/api/bezerros/:id', (req, res) => {
    const bezerroId = req.params.id;
    const fields = [];
    const values = [];

    if (req.body.nome !== undefined) {
        fields.push('nome = ?');
        values.push(req.body.nome);
    }
    if (req.body.raca !== undefined) {
        fields.push('raca = ?');
        values.push(req.body.raca);
    }
    if (req.body.peso !== undefined) {
        fields.push('peso = ?');
        values.push(req.body.peso);
    }
    if (req.body.idade !== undefined) {
        fields.push('idade = ?');
        values.push(req.body.idade);
    }
    if (req.body.imagem_base64 !== undefined) {
        fields.push('imagem_base64 = ?');
        values.push(req.body.imagem_base64 || null);
    }
    if (req.body.vendido !== undefined) {
        fields.push('vendido = ?');
        values.push(Number(req.body.vendido));
    }
    if (req.body.doente !== undefined) {
        fields.push('doente = ?');
        values.push(Number(req.body.doente));
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
    }

    values.push(bezerroId);

    db.query(`UPDATE bezerros SET ${fields.join(', ')} WHERE id = ?`, values, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Bezerro atualizado com sucesso.' });
    });
});

app.delete('/api/bezerros/:id', (req, res) => {
    db.query('DELETE FROM bezerros WHERE id = ?', [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Bezerro removido com sucesso.' });
    });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000 no Ubuntu!'));