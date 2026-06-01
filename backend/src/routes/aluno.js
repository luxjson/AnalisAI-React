const express = require('express');
const router = express.Router();
const { checkAlunoAuth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const alunoController = require('../controllers/alunoController');

router.get('/aluno', checkAlunoAuth, alunoController.dashboard);
router.get('/aluno/competencias', checkAlunoAuth, alunoController.competencias);
router.get('/aluno/evolucao', checkAlunoAuth, alunoController.evolucao);
router.get('/aluno/config', checkAlunoAuth, alunoController.config);
router.post('/aluno/alterar-senha', checkAlunoAuth, alunoController.alterarSenha);
router.get('/aluno/tarefas', checkAlunoAuth, alunoController.tarefas);
router.post('/aluno/tarefas/enviar/:id', checkAlunoAuth, upload.single('arquivo'), alunoController.enviarTarefa);
router.get('/aluno/equipe', checkAlunoAuth, alunoController.equipe);
router.get('/equipe', alunoController.equipe);
router.get('/aluno/api/dados-grafico', checkAlunoAuth, alunoController.apiDadosGrafico);
router.get('/aluno/api/ranking-comparativo', checkAlunoAuth, alunoController.apiRankingComparativo);

module.exports = router;