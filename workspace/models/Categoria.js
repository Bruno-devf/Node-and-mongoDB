const mongoose = require('mongoose');
const schema = require('mongoose').Schema;

const Categoria = new schema(   
    {
        nome: { type: String, required: true },
        slug: { type: String, required: true },
        date: { type: Date, default: Date.now }
    })
mongoose.model('categorias', Categoria);