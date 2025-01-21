// importação das bibliotecas necessárias e a utilizando para a aplicação de teste didático

// configuração do express
const express = require("express");
const app = express();
app.use(express.json());

// configuração da sessão
const session = require("express-session");
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

// configuração do flash
const flash = require("connect-flash");
app.use(flash());

// definindo um middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    next();
})

// configuração de path
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// configuração do cors
const cors = require("cors");
app.use(cors());

// configuração do body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { engine } = require("express-handlebars");

// Registrando o helper de formatação de data diretamente na configuração do Handlebars
app.engine("handlebars", engine({
    helpers: {
        // Helper de formatação de data
        formatDate: (date) => {
            const moment = require('moment');
            return moment(date).format('DD/MM/YYYY HH:mm:ss');
        },

        // Helper ifEquals para comparação de valores
        ifEquals: function (a, b, options) {
            if (a == b) {
                return options.fn(this);  // Executa o bloco {{#ifEquals}} se a comparação for verdadeira
            } else {
                return options.inverse(this);  // Executa o bloco {{else}} se a comparação for falsa
            }
        }
    }
}));

app.set("view engine", "handlebars");

// configuração do mongoose
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
const db = "mongodb://127.0.0.1:27017/blogapp";
mongoose.connect(db)
    .then(() => {
        console.log("Conectado ao banco de dados");
    })
    .catch(err => {
        console.log("Erro ao conectar ao banco de dados:", err);
    });

// importação das rotas
const admin = require("./routes/admin");
app.use("/admin", admin);

// execução do servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
