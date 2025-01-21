const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
require('../models/Postagem');
const Categoria = mongoose.model('categorias');
const Postagem = mongoose.model('postagens');
    
//rotas CRUD de categorias
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
//fim das rotas de categorias

//rotas CRUD de postagens
router.get('/postagens', (req, res) => {
    Postagem.find()
        .populate('categoria')
        .lean()
        .sort({ date: 'desc' })
        .then((postagens) => {
            res.render('admin/postagens', { Postagens: postagens });
        })
        .catch((error) => {
            req.flash('error_msg', 'Erro ao buscar postagens');
            console.error(error);
            res.status(500).send('Erro ao buscar postagens');
            res.redirect('/admin');
        });
});




router.get('/postagens/add', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addpostagem', { Categorias: categorias });
    }).catch((error) => {
        req.flash('error_msg', 'Erro ao buscar categorias');
        console.error(error);
        res.status(500).send('Erro ao buscar categorias');
        res.redirect('/admin');
    });
});

router.post('/postagens/nova', (req, res) => {
    var erros = [];

    // Validação do formulário
    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({ texto: 'Titulo inválido' });
    } else if (!req.body.titulo.charAt(0).toUpperCase() === req.body.titulo.charAt(0)) {
        erros.push({ texto: 'Titulo deve começar com letra maiúscula' });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: 'Slug inválido' });
    } else if (!/^[a-z0-9-]+$/.test(req.body.slug)) {
        erros.push({ texto: 'Slug inválido' });
    }

    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({ texto: 'Descrição inválida' });
    }

    if (req.body.categoria == '0') {
        erros.push({ texto: 'Categoria inválida' });
    }

    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({ texto: 'Conteúdo inválido' });
    }

    if (erros.length > 0) {
        // Buscar categorias novamente quando houver erros
        Categoria.find().lean().then((categorias) => {
            req.flash('error_msg', erros.map((erro) => erro.texto).join(' '));
            res.render('admin/addpostagem', {
                erros: erros,
                Categorias: categorias,
                categoriaSelecionada: req.body.categoria
            });
        }).catch((error) => {
            req.flash('error_msg', 'Erro ao buscar categorias');
            console.error(error);
            res.status(500).send('Erro ao buscar categorias');
            res.redirect('/admin');
        });
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            date: new Date()
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso');
            res.redirect('/admin/postagens');
        }).catch((error) => {
            console.error(error);
            req.flash('error_msg', 'Erro ao criar postagem');
            res.status(500).send('Erro ao criar postagem');
            res.redirect('/admin/postagens');
        });
    }
});


router.get('/postagens/edit/:id', (req, res) => {
    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagem', { Postagem: postagem, Categorias: categorias });
        }).catch((error) => {
            req.flash('error_msg', 'Erro ao buscar categorias');
            console.error(error);
            res.status(500).send('Erro ao buscar categorias');
            res.redirect('/admin');
        });
    }).catch((error) => {
        req.flash('error_msg', 'Erro ao buscar postagem');
        console.error(error);
        res.status(500).send('Erro ao buscar postagem');
        res.redirect('/admin/postagens');
    });
});

router.post('/postagens/edit/', (req, res) => {
    Postagem.findOne({ _id: req.body.id }).then((postagem) => {
        if (!postagem) {
            req.flash('error_msg', 'Postagem não encontrada');
            return res.redirect('/admin/postagens');
        }

        // Atualizando os dados da postagem com as novas informações do formulário
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem atualizada com sucesso');
            res.redirect('/admin/postagens');
        }).catch((error) => {
            req.flash('error_msg', 'Erro ao atualizar postagem');
            console.error(error);
            res.status(500).send('Erro ao atualizar postagem');
            res.redirect('/admin/postagens');
        });
    }).catch((error) => {
        req.flash('error_msg', 'Erro ao buscar postagem');
        console.error(error);
        res.status(500).send('Erro ao buscar postagem');
        res.redirect('/admin/postagens');
    });
});

router.post('/postagem/deletar', (req, res) => {
    Postagem.deleteOne({ _id: req.body.id }).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso');
        res.redirect('/admin/postagens');
    }).catch((error) => {
        req.flash('error_msg', 'Erro ao deletar postagem');
        console.error(error);
        res.status(500).send('Erro ao deletar postagem');
    });
});

module.exports = router;