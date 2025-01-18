//importação das bibliotecas necessárias e a utilizando para a aplicação de teste didático
const express = require("express");
const app = express();
app.use(express.json());

//configuração do cors
const cors = require("cors");
app.use(cors());
//configuração do body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//configuração do handlebars
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");


//configuração do mongoose

/*
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
const db = "mongodb://127.0.0.1:27017/blog";
mongoose.connect(db)
.then(() => {
    console.log("Conectado ao banco de dados");
})
.catch(err => {
    console.log("Erro ao conectar ao banco de dados:", err);
});
        
*/
       
//importação das rotas
const admin = require("./routes/admin");
app.use("/admin", admin);
       

//execução do servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(` Servidor rodando na porta ${port}`);
});