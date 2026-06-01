const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const favicon = require('serve-favicon');
const path = require('path');
const db = require('./db');
const cors = require('cors');

const app = express();

const indexRoutes = require('./routes/index');
const professorRoutes = require('./routes/professor');
const alunoRoutes = require('./routes/aluno');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

const flashMiddleware = require('./middlewares/flash');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'chave-secreta-meu-site',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());
app.use(flashMiddleware);

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRoutes);
app.use('/', professorRoutes);
app.use('/', alunoRoutes);
app.use('/', adminRoutes);
app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).render('error', {
    titulo: 'PÁGINA NÃO ENCONTRADA',
    mensagem: 'A página que você está procurando não existe.',
    erroDetalhe: null,
    user: req.session?.user,
    userCargo: req.session?.userCargo,
    isAdmin: req.session?.userCargo === 'Admin'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === '23514') {
    req.flash('error_msg', err.detail || 'Erro de validação');
    return res.redirect(req.get('referer') || '/dashboard');
  }
  return res.status(500).render('error', {
    titulo: 'ERRO NO SERVIDOR',
    mensagem: 'Ocorreu um erro interno no servidor.',
    erroDetalhe: process.env.NODE_ENV === 'development' ? err.message : null,
    user: req.session?.user,
    userCargo: req.session?.userCargo,
    isAdmin: req.session?.userCargo === 'Admin'
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));