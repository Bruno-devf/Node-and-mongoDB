const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
const bcrypt = require('bcryptjs'); // Usado para criptografar a senha
const passport = require('passport');
const eAdmin = require('../helpers/eAdmin');
require('../config/auth');

// Função para validar email com regex
function validarEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}

// Função para validar senha
function validarSenha(senha) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(senha);
}

// Rota GET para exibir o formulário de registro
router.get('/registro', (req, res) => {
    res.render('usuario/registro');
});

// Rota POST para processar o registro
router.post('/registro', async (req, res) => {
    const { nome, email, senha, senha2 } = req.body;
    let erros = [];

    // Validação do nome
    if (!nome || typeof nome === undefined || nome === null) {
        erros.push({ texto: 'Nome inválido' });
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nome)) { // Verifica se o nome contém apenas letras e espaços
        erros.push({ texto: 'Nome contém caracteres inválidos' });
    } else if (nome.charAt(0) !== nome.charAt(0).toUpperCase()) {
        erros.push({ texto: 'Nome deve começar com letra maiúscula' });
    }

    // Validação do email
    if (!email || typeof email === undefined || email === null) {
        erros.push({ texto: 'Email inválido' });
    } else if (!validarEmail(email)) {
        erros.push({ texto: 'Formato de email inválido' });
    }

    // Validação da senha
    if (!senha || typeof senha === undefined || senha === null) {
        erros.push({ texto: 'Senha inválida' });
    }

    // Validação para garantir que as senhas são iguais
    if (senha !== senha2) {
        erros.push({ texto: 'As senhas não coincidem' });
    }

    // Se houver erros, renderiza o formulário de registro com as mensagens de erro
    if (erros.length > 0) {
        return res.render('usuario/registro', {
            erros,
            nome,
            email,
        });
    }

    try {
        // Verifica se o email já existe no banco de dados
        const usuarioExistente = await Usuario.findOne({ email });

        if (usuarioExistente) {
            req.flash('error_msg', 'Email já cadastrado');
            return res.redirect('/usuario/registro');  // Resposta de erro e redirecionamento, com "return" para evitar múltiplas respostas.
        }

        // Se o email não existir, cria um novo usuário
        const novoUsuario = new Usuario({
            nome,
            email,
            senha
        });

        // Criptografando a senha antes de salvar
        const salt = await bcrypt.genSalt(10);
        novoUsuario.senha = await bcrypt.hash(novoUsuario.senha, salt);

        // Salvando o usuário no banco
        await novoUsuario.save();

        req.flash('success_msg', 'Usuário criado com sucesso');
        return res.redirect('/usuario/registro'); // Redireciona após o registro

    } catch (erro) {
        console.error(erro);
        req.flash('error_msg', 'Erro ao criar usuário');
        return res.status(500).send('Erro ao criar usuário'); // Trata erro de criação
    }
});


router.get('/login', (req, res) => {
    res.render('usuario/login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuario/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            // Se houver um erro, você pode tratar aqui, por exemplo:
            return res.status(500).send('Erro ao deslogar');
        }
        req.flash('success_msg', 'Deslogado com sucesso');
        res.redirect('/usuario/login');
    });
});

module.exports = router;
