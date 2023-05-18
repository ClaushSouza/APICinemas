const express = require('express');
const mysql = require('mysql');

const app = express();
app.use(express.json());

// Configuração do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'seu_usuario',
  password: 'sua_senha',
  database: 'cinemaproject',
});

// Rotas da API

// Obter todos os cinemas
app.get('/cinemas', (req, res) => {
  db.query('SELECT * FROM cinemas', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Ocorreu um erro ao obter os cinemas.' });
    } else {
      res.json(results);
    }
  });
});

// Obter todos os filmes
app.get('/filmes', (req, res) => {
  db.query('SELECT * FROM filmes', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Ocorreu um erro ao obter os filmes.' });
    } else {
      res.json(results);
    }
  });
});

// Obter todas as sessões de um cinema específico
app.get('/cinemas/:cinemaId/sessoes', (req, res) => {
  const cinemaId = req.params.cinemaId;

  db.query('SELECT * FROM sessoes WHERE cinema_id = ?', [cinemaId], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Ocorreu um erro ao obter as sessões.' });
    } else {
      res.json(results);
    }
  });
});

// Criar um novo ingresso
app.post('/ingressos', (req, res) => {
  const { sessaoId, quantidade } = req.body;

  // Verificar a capacidade da sala antes de criar o ingresso
  db.query('SELECT capacidade FROM sessoes WHERE id = ?', [sessaoId], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Ocorreu um erro ao verificar a capacidade da sala.' });
    } else {
      const capacidade = results[0].capacidade;

      // Verificar se há capacidade disponível na sala
      db.query(
        'SELECT SUM(quantidade) AS total_ingressos FROM ingressos WHERE sessao_id = ?',
        [sessaoId],
        (err, results) => {
          if (err) {
            res.status(500).json({ error: 'Ocorreu um erro ao verificar a lotação da sala.' });
          } else {
            const totalIngressos = results[0].total_ingressos || 0;
            const capacidadeDisponivel = capacidade - totalIngressos;

            if (quantidade > capacidadeDisponivel) {
              res.status(400).json({ error: 'Não há capacidade disponível na sala.' });
            } else {
              // Criar o ingresso
              db.query(
                'INSERT INTO ingressos (sessao_id, quantidade) VALUES (?, ?)',
                [sessaoId, quantidade],
                (err, results) => {
                  if (err) {
                    res.status(500).json({ error: 'Ocorreu um erro ao criar o ingresso.' });
                  } else {
                    res.json({ message: 'Ingresso criado com sucesso.' });
                  }
                }

              );
            }
          }
        }
      );
    }
  });
});

// Iniciar o servidor
app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
});