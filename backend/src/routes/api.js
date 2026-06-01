const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/notificacoes', apiController.getNotificacoes);
router.post('/notificacoes/marcar-lida/:id', apiController.marcarNotificacaoLida);
router.post('/notificacoes/marcar-todas-lidas', apiController.marcarTodasNotificacoesLidas);
router.get('/configuracoes-notificacoes', apiController.getConfiguracoesNotificacoes);
router.post('/configuracoes-notificacoes', apiController.saveConfiguracoesNotificacoes);
router.get('/tarefas-stats', apiController.tarefasStats);
router.get('/aluno/dados-grafico', apiController.alunoDadosGrafico);
router.get('/aluno/ranking-comparativo', apiController.alunoRankingComparativo);

module.exports = router;