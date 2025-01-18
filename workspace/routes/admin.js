const express = require('express');
const router = express.Router();

router.get('/admin', (req, res) => {
    res.send('Página do Admin');
});
    
router.get('/posts', (req, res) => {
    res.send('Página dos Posts');
});

router.get('/categorias', (req, res) => {
    res.send('Página das Categorias');
});

module.exports = router;