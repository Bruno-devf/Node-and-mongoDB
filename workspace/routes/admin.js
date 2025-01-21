const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');

router.get('/', (req, res) => {
    res.render('admin/index');
});
    
router.get('/posts', (req, res) => {
    res.send('Página dos Posts');
});

router.get('/categorias', (req, res) => {
    Categoria.find().lean().sort({ date: 'desc' }).then((categorias) => {
        res.render('admin/categorias', {Categorias: categorias}); 
    }).catch((error) => {
        req.flash('error_msg', 'Erro ao buscar categorias');
        console.error(error);
        res.status(500).send('Erro ao buscar categorias');
        res.redirect('/admin');
    });
});

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias');
});

router.post('/categorias/nova', (req, res) => {

    var erros = [];

    // Validação do nome
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: 'Nome inválido' });
    } else if (!req.body.nome.charAt(0).toUpperCase() === req.body.nome.charAt(0)) {
        erros.push({ texto: 'Nome deve começar com letra maiúscula' });
    }

    // Validação do slug
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: 'Slug inválido' });
    } else if (!/^[a-z0-9-]+$/.test(req.body.slug)) {
        erros.push({ texto: 'Slug não pode conter maiúsculas, espaços ou caracteres especiais' });
    }

    // Se houver erros, renderiza a página novamente com as mensagens de erro
    if (erros.length > 0) {
        res.render('admin/addcategorias', { erros: erros });
    } else {
        // Garantir que o nome tenha a primeira letra maiúscula
        const nomeFormatado = req.body.nome.charAt(0).toUpperCase() + req.body.nome.slice(1).toLowerCase();

        const novaCat = {
            nome: nomeFormatado,  // Usando o nome formatado
            slug: req.body.slug
        };

        try {
            new Categoria(novaCat).save().then(() => {
                req.flash('success_msg', 'Categoria criada com sucesso');
                res.redirect('/admin/categorias');
            }).catch((error) => {
                console.error(error);
                res.status(500).send('Erro ao salvar categoria');
            });
        } catch (error) {
            req.flash('error_msg', 'Erro ao criar categoria');
            console.error(error);
            res.status(500).send('Erro ao criar categoria');
        }
    }
});

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render('admin/editcategorias', { Categoria: categoria });
    }).catch((error) => {
        req.flash('error_msg', 'Erro ao buscar categoria');
        console.error(error);
        res.status(500).send('Erro ao buscar categoria');
        res.redirect('/admin/categorias');
    });
});

router.post('/categorias/edit', (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria atualizada com sucesso');
            res.redirect('/admin/categorias');    
        }).catch((error) => {
            req.flash('error_msg', 'Erro ao atualizar categoria');
            console.error(error);
            res.status(500).send('Erro ao atualizar categoria');
            res.redirect('/admin/categorias');
        });
    }).catch((error) => {
        req.flash('error_msg', 'Erro ao buscar categoria');
        console.error(error);
        res.status(500).send('Erro ao buscar categoria');
        res.redirect('/admin/categorias');
    });
});

router.post('/categorias/deletar', (req, res) => {
    Categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso');
        res.redirect('/admin/categorias');
    }).catch((error) => {
        req.flash('error_msg', 'Erro ao deletar categoria');
        console.error(error);
        res.status(500).send('Erro ao deletar categoria');
    });
});


module.exports = router;