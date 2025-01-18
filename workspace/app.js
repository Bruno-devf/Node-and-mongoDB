//importação das bibliotecas necessárias e a utilizando para a aplicação de teste didático
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");


//configuração do mongoose
mongoose.Promise = global.Promise;
const db = "mongodb://127.0.0.1:27017/aprendendo";
mongoose.connect(db)
    .then(() => {
        console.log("Conectado ao banco de dados");
    })
    .catch(err => {
        console.log("Erro ao conectar ao banco de dados:", err);
    });


//definindo o model
    const usuarioSchema = new mongoose.Schema({
        nome: String,
        idade: Number,
        email: String
    });

//definindo a colleção
const Usuario = mongoose.model("Usuario", usuarioSchema);
    
//adiciona um novo usuário

const novoUsuario = new Usuario({
    nome: "Jhon Doe",
    idade: 30,
    email: "jhon@example.com"
});

novoUsuario.save().then(() => {
    console.log("Usuário adicionado com sucesso");
}).catch(err => {
    console.log("Erro ao adicionar usuário:", err);
});



//configuração das rotas
app.get("/", (req, res) => {    
    res.send("Hello World!");
});

//execução do servidor
app.listen(port, () => {
    console.log(` Servidor rodando na porta ${port}`);
});