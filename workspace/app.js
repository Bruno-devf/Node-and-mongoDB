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


//configuração das rotas
app.get("/", (req, res) => {    
    res.send("Hello World!");
});

//execução do servidor
app.listen(port, () => {
    console.log(` Servidor rodando na porta ${port}`);
});