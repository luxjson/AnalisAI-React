const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

router.get('/', authController.showHome);
router.get('/termos', authController.showTermos);
router.get('/manuais', authController.showManuais);
router.get('/manuais/professor', authController.showManualDeUso);
router.get('/manuais/aluno', authController.showManualDoAluno);
router.get('/login', authController.showLogin);
router.post('/login/professor', authController.loginProfessor);
router.post('/login/aluno', authController.loginAluno);
router.get('/logout', authController.logout);
router.get('/esquecisenha', authController.showEsqueciSenha);
router.post('/esquecisenha/solicitar', authController.solicitarRedefinicaoSenha);

module.exports = router;