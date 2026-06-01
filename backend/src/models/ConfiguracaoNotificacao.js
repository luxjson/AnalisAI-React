const db = require('../db');

class ConfiguracaoNotificacao {
    static async findByUsuarioId(usuarioId) {
        const result = await db.query(
            'SELECT * FROM configuracoes_notificacoes WHERE usuario_id = $1',
            [usuarioId]
        );
        return result.rows[0];
    }

    static async findByAlunoId(alunoId) {
        const result = await db.query(
            'SELECT * FROM configuracoes_notificacoes WHERE aluno_id = $1',
            [alunoId]
        );
        return result.rows[0];
    }

    static async createOrUpdateForUsuario(usuarioId, config = {}) {
        const {
            notificacoes_ativas = true,
            notificacoes_email = false,
            notificacoes_tarefas = true,
            notificacoes_avaliacoes = true,
            notificacoes_competencias = true
        } = config;

        const check = await db.query(
            'SELECT id FROM configuracoes_notificacoes WHERE usuario_id = $1',
            [usuarioId]
        );

        if (check.rows.length > 0) {
            const result = await db.query(
                `UPDATE configuracoes_notificacoes SET 
                 notificacoes_ativas = $1, notificacoes_email = $2, notificacoes_tarefas = $3, 
                 notificacoes_avaliacoes = $4, notificacoes_competencias = $5
                 WHERE usuario_id = $6 RETURNING *`,
                [notificacoes_ativas, notificacoes_email, notificacoes_tarefas, notificacoes_avaliacoes, notificacoes_competencias, usuarioId]
            );
            return result.rows[0];
        } else {
            const result = await db.query(
                `INSERT INTO configuracoes_notificacoes 
                 (usuario_id, notificacoes_ativas, notificacoes_email, notificacoes_tarefas, notificacoes_avaliacoes, notificacoes_competencias) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [usuarioId, notificacoes_ativas, notificacoes_email, notificacoes_tarefas, notificacoes_avaliacoes, notificacoes_competencias]
            );
            return result.rows[0];
        }
    }

    static async createOrUpdateForAluno(alunoId, config = {}) {
        const {
            notificacoes_ativas = true,
            notificacoes_email = false,
            notificacoes_tarefas = true,
            notificacoes_avaliacoes = true,
            notificacoes_competencias = true
        } = config;

        const check = await db.query(
            'SELECT id FROM configuracoes_notificacoes WHERE aluno_id = $1',
            [alunoId]
        );

        if (check.rows.length > 0) {
            const result = await db.query(
                `UPDATE configuracoes_notificacoes SET 
                 notificacoes_ativas = $1, notificacoes_email = $2, notificacoes_tarefas = $3, 
                 notificacoes_avaliacoes = $4, notificacoes_competencias = $5
                 WHERE aluno_id = $6 RETURNING *`,
                [notificacoes_ativas, notificacoes_email, notificacoes_tarefas, notificacoes_avaliacoes, notificacoes_competencias, alunoId]
            );
            return result.rows[0];
        } else {
            const result = await db.query(
                `INSERT INTO configuracoes_notificacoes 
                 (aluno_id, notificacoes_ativas, notificacoes_email, notificacoes_tarefas, notificacoes_avaliacoes, notificacoes_competencias) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [alunoId, notificacoes_ativas, notificacoes_email, notificacoes_tarefas, notificacoes_avaliacoes, notificacoes_competencias]
            );
            return result.rows[0];
        }
    }
}

module.exports = ConfiguracaoNotificacao;