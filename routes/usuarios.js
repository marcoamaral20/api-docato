const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

router.get('/all', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error}) }
        conn.query(
            'SELECT * FROM usuarios',
            (error, response, fields) => {
                if (error) { return res.status(500).send({ error: error}) }
                return res.status(200).send({response })
            }
        )
    });
});

router.post('/cadastro', (req, res, next) => {
    mysql.getConnection((err, conn) => {
        if (err) { return res.status(500).send({ error: error}) }
        conn.query('SELECT * FROM usuarios WHERE email = ?', 
        [req.body.email], (error, results) => {
            if( error ) { return res.status(500).send({error: error})}
            if(results.length > 0) {
                res.status(409).send({ mensagem: 'Usuário já cadastrado'})
            } else {
                bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                    if(errBcrypt) {return res.status(500).send({error: errBcrypt})}
                    conn.query(`INSERT INTO usuarios (email, senha, cpf, nome, apelido) VALUES (?,?,?,?,?)`, 
                    [req.body.email, hash, req.body.cpf, req.body.nome, req.body.apelido],
                    (error, results) => {
                        conn.release();
                        if(error) { return res.status(500).send({error: error})}
                        response = {
                            mensagem: "Usuário criado com sucesso",
                            usuarioCriado: {
                                id_usuario: results.insertId,
                                email: req.body.email
                            }
                        }
                        return res.status(201).send(response);
                    })
                });
            }
        })
    });
})

router.post('/login', (req, res, net) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({error : error})}
        const query = `SELECT * FROM usuarios WHERE email = ?`;
        conn.query(query,[req.body.email],(error, results, fields) => {
            conn.release();
            if(error) { return res.status(500).send({error : error})}
            if(results.length < 1) {
                return res.status(401).send({ mensagem: 'Falha na autenticação'})
            }
            bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
                if(err) {
                    return res.status(401).send({ mensagem: 'Falha de autenticação'})
                }
                if(result) {
                    const token = jwt.sign({
                        id_usuario: results[0].id_usuario,
                        email: results[0].email
                    },
                     process.env.JWT_KEY,
                    {
                        expiresIn: "1h"
                    });

                    response = {
                        mensagem: 'Autenticado com sucesso',
                        token: token
                    }
                    
                    return res.status(200).send({
                        status: "ok", response
                    });
                    
                }
                return res.status(401).send({ status: "error", mensagem: 'Falha de autenticação'})
            })
        })
    })
})

// RETORNA OS DADOS DE UM PRODUTO
router.get('/:id_usuario',(req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error}) }
        conn.query(
            'SELECT * FROM usuarios WHERE id_usuario = ?;',
            [req.params.id_usuario],
            (error, response, fields) => {
                if (error) { return res.status(500).send({ error: error}) }

                if ( response.length == 0) {
                    return res.status(404).send({
                        mensagem: "Não foi encontrando usuário com este ID"
                    })
                }
                return res.status(200).send({response })
                
            }
        )   
    }); 
});

// ALTERA UM PRODUTO

router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error}) }
        conn.query(
            `UPDATE usuarios
                SET email        = ?,
                    senha        = ?,
                    cpf          = ?,
                    nome         = ?,
                    apelido      = ?
              WHERE id_usuario   = ?`,
            [req.body.email, req.body.senha, req.body.cpf, req.body.nome, req.body.apelido, req.body.id_usuario],
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error}) }
                res.status(202).send({mensagem: 'Usuário atualizado com sucesso'});
            }
        )
    });    
});

// DELETA UM PRODUTO

router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error}) }
        conn.query(
           'DELETE FROM usuarios WHERE id_usuario = ?',
            [req.body.id_usuario],
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error}) }
                return res.status(202).send({mensagem: 'Usuário removido com sucesso'});
            }
        )
    })
});

module.exports = router;