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

app.engine("handlebars", engine({
    helpers: {
        formatDate: (date) => {
            const moment = require('moment');
            return moment(date).format('DD/MM/YYYY HH:mm:ss');
        },
        ifEquals: function (a, b, options) {
            if (a == b) {
                return options.fn(this);
            } else {
                return options.inverse(this);
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

// importação das rotas e configuração das rotas
const admin = require("./routes/admin");
app.use("/admin", admin);
require("./models/Categoria");
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
const Categoria = mongoose.model("categorias");

//rota raiz
app.get("/", (req, res) => {
    Postagem.find().lean().populate("categoria").sort({ date: "desc" }).then((postagens) => {
        res.render("index", { postagens: postagens });
    }).catch((error) => {
        req.flash("error_msg", "Erro ao buscar postagens");
        console.error(error);
        res.status(500).send("Erro ao buscar postagens");
        res.redirect("/404");
    })
});

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).lean().then((postagem) => {
        if (postagem) {
            res.render("postagem/index", { postagem: postagem });
        } else {
            req.flash("error_msg", "Postagem não encontrada");
            res.redirect("/");
        }
    }).catch((error) => {
        req.flash("error_msg", "Erro ao buscar postagem");
        console.error(error);
        res.status(500).send("Erro ao buscar postagem");
        res.redirect("/404");
    })
});

app.get("/404", (req, res) => {
    res.render("404");
})

// execução do servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
