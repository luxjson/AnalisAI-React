const db = require('../db');
const { criarNotificacao } = require('../utils/notificacao');

exports.getNotificacoes = async (req, res) => {
    try {
        let query = '';
        let params = [];
        if (req.session.aluno) {
            query = `SELECT * FROM notificacoes WHERE aluno_id = $1 AND lida = false ORDER BY data_criacao DESC LIMIT 20`;
            params = [req.session.aluno.id];
        } else if (req.session.user) {
            query = `SELECT * FROM notificacoes WHERE usuario_id = $1 AND lida = false ORDER BY data_criacao DESC LIMIT 20`;
            params = [req.session.userId];
        } else {
            return res.json({ notificacoes: [], totalNaoLidas: 0 });
        }
        const result = await db.query(query, params);
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM notificacoes WHERE ${req.session.aluno ? 'aluno_id' : 'usuario_id'} = $1 AND lida = false`,
            [req.session.aluno ? req.session.aluno.id : req.session.userId]
        );
        res.json({
            notificacoes: result.rows,
            totalNaoLidas: parseInt(countResult.rows[0].total)
        });
    } catch (err) {
        console.error('Erro ao buscar notificações:', err);
        res.status(500).json({ error: 'Erro ao buscar notificações' });
    }
};

exports.marcarNotificacaoLida = async (req, res) => {
    try {
        const id = req.params.id;
        let query = '';
        let params = [];
        if (req.session.aluno) {
            query = `UPDATE notificacoes SET lida = true WHERE id = $1 AND aluno_id = $2 RETURNING id`;
            params = [id, req.session.aluno.id];
        } else if (req.session.user) {
            query = `UPDATE notificacoes SET lida = true WHERE id = $1 AND usuario_id = $2 RETURNING id`;
            params = [id, req.session.userId];
        } else {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        const result = await db.query(query, params);
        if (result.rows.length > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Notificação não encontrada' });
        }
    } catch (err) {
        console.error('Erro ao marcar notificação como lida:', err);
        res.status(500).json({ error: 'Erro ao processar' });
    }
};

exports.marcarTodasNotificacoesLidas = async (req, res) => {
    try {
        let query = '';
        let params = [];
        if (req.session.aluno) {
            query = `UPDATE notificacoes SET lida = true WHERE aluno_id = $1 AND lida = false`;
            params = [req.session.aluno.id];
        } else if (req.session.user) {
            query = `UPDATE notificacoes SET lida = true WHERE usuario_id = $1 AND lida = false`;
            params = [req.session.userId];
        } else {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        await db.query(query, params);
        res.json({ success: true });
    } catch (err) {
        console.error('Erro ao marcar todas como lidas:', err);
        res.status(500).json({ error: 'Erro ao processar' });
    }
};

exports.getConfiguracoesNotificacoes = async (req, res) => {
    try {
        let query = '';
        let params = [];
        if (req.session.aluno) {
            query = `SELECT * FROM configuracoes_notificacoes WHERE aluno_id = $1`;
            params = [req.session.aluno.id];
        } else if (req.session.user) {
            query = `SELECT * FROM configuracoes_notificacoes WHERE usuario_id = $1`;
            params = [req.session.userId];
        } else {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        let result = await db.query(query, params);
        if (result.rows.length === 0) {
            if (req.session.aluno) {
                result = await db.query(
                    `INSERT INTO configuracoes_notificacoes (aluno_id) VALUES ($1) RETURNING *`,
                    [req.session.aluno.id]
                );
            } else {
                result = await db.query(
                    `INSERT INTO configuracoes_notificacoes (usuario_id) VALUES ($1) RETURNING *`,
                    [req.session.userId]
                );
            }
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao buscar configurações:', err);
        res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
};

exports.saveConfiguracoesNotificacoes = async (req, res) => {
    try {
        const { notificacoes_ativas, notificacoes_email, notificacoes_tarefas, notificacoes_avaliacoes, notificacoes_competencias } = req.body;
        let query = '';
        let params = [];
        if (req.session.aluno) {
            const check = await db.query(
                'SELECT id FROM configuracoes_notificacoes WHERE aluno_id = $1',
                [req.session.aluno.id]
            );
            if (check.rows.length > 0) {
                query = `UPDATE configuracoes_notificacoes SET 
                         notificacoes_ativas = $1, notificacoes_email = $2, notificacoes_tarefas = $3, 
                         notificacoes_avaliacoes = $4, notificacoes_competencias = $5
                         WHERE aluno_id = $6 RETURNING *`;
                params = [notificacoes_ativas, notificacoes_email, notificacoes_tarefas, notificacoes_avaliacoes, notificacoes_competencias, req.session.aluno.id];
            } else {
                query = `INSERT INTO configuracoes_notificacoes 
                         (aluno_id, notificacoes_ativas, notificacoes_email, notificacoes_tarefas, notificacoes_avaliacoes, notificacoes_competencias) 
                         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
                params = [req.session.aluno.id, notificacoes_ativas, notificacoes_email, notificacoes_tarefas, notificacoes_avaliacoes, notificacoes_competencias];
            }
        } else if (req.session.user) {
            const check = await db.query(
                'SELECT id FROM configuracoes_notificacoes WHERE usuario_id = $1',
                [req.session.userId]
            );
            if (check.rows.length > 0) {
                query = `UPDATE configuracoes_notificacoes SET 
                         notificacoes_ativas = $1, notificacoes_email = $2, notificacoes_tarefas = $3, 
                         notificacoes_avaliacoes = $4, notificacoes_competencias = $5
                         WHERE usuario_id = $6 RETURNING *`;
                params = [notificacoes_ativas, notificacoes_email, notificacoes_tarefas, notificacoes_avaliacoes, notificacoes_competencias, req.session.userId];
            } else {
                query = `INSERT INTO configuracoes_notificacoes 
                         (usuario_id, notificacoes_ativas, notificacoes_email, notificacoes_tarefas, notificacoes_avaliacoes, notificacoes_competencias) 
                         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
                params = [req.session.userId, notificacoes_ativas, notificacoes_email, notificacoes_tarefas, notificacoes_avaliacoes, notificacoes_competencias];
            }
        } else {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        const result = await db.query(query, params);
        res.json({ success: true, config: result.rows[0] });
    } catch (err) {
        console.error('Erro ao salvar configurações:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.tarefasStats = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'ATIVA' THEN 1 END) as ativas,
                COUNT(CASE WHEN data_entrega < CURRENT_DATE AND status = 'ATIVA' THEN 1 END) as atrasadas,
                COUNT(CASE WHEN prioridade = 'ALTA' AND status = 'ATIVA' THEN 1 END) as prioridade_alta
            FROM tarefas
        `);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
};

exports.alunoDadosGrafico = async (req, res) => {
    try {
        if (!req.session.aluno) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        const alunoId = req.session.aluno.id;
        const result = await db.query(`
            SELECT 
                c.nome,
                ac.nota,
                c.categoria
            FROM aluno_competencias ac
            JOIN competencias c ON ac.competencia_id = c.id
            WHERE ac.aluno_id = $1
            ORDER BY c.categoria, ac.nota DESC
        `, [alunoId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar dados do gráfico:', err);
        res.status(500).json({ error: 'Erro ao carregar dados' });
    }
};

exports.alunoRankingComparativo = async (req, res) => {
    try {
        if (!req.session.aluno) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        const alunoId = req.session.aluno.id;
        const aluno = req.session.aluno;
        const alunoMedia = await db.query(`
            SELECT COALESCE(AVG(nota), 0) as media
            FROM aluno_competencias
            WHERE aluno_id = $1
        `, [alunoId]);
        const turmaMedia = await db.query(`
            SELECT COALESCE(AVG(ac.nota), 0) as media
            FROM aluno_competencias ac
            JOIN alunos a ON ac.aluno_id = a.id
            WHERE a.ano_escolar = $1
        `, [aluno.ano_escolar]);
        const geralMedia = await db.query(`
            SELECT COALESCE(AVG(nota), 0) as media
            FROM aluno_competencias
        `);
        res.json({
            aluno: parseFloat(alunoMedia.rows[0].media).toFixed(1),
            turma: parseFloat(turmaMedia.rows[0].media).toFixed(1),
            geral: parseFloat(geralMedia.rows[0].media).toFixed(1)
        });
    } catch (err) {
        console.error('Erro ao buscar ranking comparativo:', err);
        res.status(500).json({ error: 'Erro ao carregar dados' });
    }
};