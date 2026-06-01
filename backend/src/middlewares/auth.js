function checkAuth(req, res, next) {
  if (req.session.user && req.session.userStatus === 'ATIVO') {
    next();
  } else {
    req.session.destroy();
    res.redirect('/login');
  }
}

function checkAdmin(req, res, next) {
  if (req.session.userCargo === 'Admin') {
    next();
  } else {
    req.flash('error_msg', 'Acesso negado. Apenas administradores podem gerenciar usuários.');
    res.redirect('/dashboard');
  }
}

function checkAlunoAuth(req, res, next) {
  if (req.session.aluno) {
    next();
  } else {
    res.redirect('/login');
  }
}

module.exports = { checkAuth, checkAdmin, checkAlunoAuth };