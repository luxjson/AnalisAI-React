const db = require('../db');
const { criarNotificacao } = require('../utils/notificacao');

exports.listarUsuarios = async (req, res) => {
    try {
        const result = await db.query('SELECT id, nome, email, cargo, status FROM usuarios ORDER BY nome ASC');
        const isAdmin = req.session.userCargo === 'Admin';
        const userCargo = req.session.userCargo;
        const userId = req.session.userId;
        const user = req.session.user;
        res.json({ 
            usuarios: result.rows,
            isAdmin: isAdmin,
            userCargo: userCargo,
            userId: userId,
            user: user,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')});
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Erro ao carregar usuários');
        res.redirect('/dashboard');
    }
};

exports.adicionarUsuario = async (req, res) => {
    const { nome, email, senha, cargo } = req.body;
    try {
        await db.query(
            'INSERT INTO usuarios (nome, email, senha, cargo, status) VALUES ($1, $2, $3, $4, $5)',
            [nome, email.toLowerCase(), senha, cargo, 'ATIVO']
        );
        req.flash('success_msg', 'Usuário cadastrado com sucesso!');
        res.redirect('/dashboard/usuarios');
    } catch (err) {
        req.flash('error_msg', 'Erro ao cadastrar usuário');
        res.redirect('/dashboard/usuarios');
    }
};

exports.atualizarUsuario = async (req, res) => {
    const { id, nome, email, cargo, status } = req.body;
    try {
        await db.query(
            'UPDATE usuarios SET nome=$1, email=$2, cargo=$3, status=$4 WHERE id=$5',
            [nome, email.toLowerCase(), cargo, status, id]
        );
        req.flash('success_msg', 'Usuário atualizado com sucesso!');
        res.redirect('/dashboard/usuarios');
    } catch (err) {
        req.flash('error_msg', 'Erro ao atualizar usuário');
        res.redirect('/dashboard/usuarios');
    }
};

exports.deletarUsuario = async (req, res) => {
    try {
        await db.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
        req.flash('success_msg', 'Usuário removido com sucesso!');
        res.redirect('/dashboard/usuarios');
    } catch (err) {
        req.flash('error_msg', 'Erro ao excluir usuário');
        res.redirect('/dashboard/usuarios');
    }
};

exports.listarSolicitacoesSenha = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                s.*,
                u.nome
            FROM solicitacoes_senha s
            JOIN usuarios u ON s.usuario_id = u.id
            WHERE s.status = 'PENDENTE'
            ORDER BY s.data_solicitacao DESC
        `);
        res.json({
            solicitacoes: result.rows,
            user: req.session.user,
            userCargo: req.session.userCargo,
            isAdmin: req.session.userCargo === 'Admin'
        });
    } catch (err) {
        console.error('Erro ao carregar solicitações:', err);
        req.flash('error_msg', 'Erro ao carregar solicitações');
        res.redirect('/dashboard');
    }
};

exports.aprovarSolicitacaoSenha = async (req, res) => {
    const { nova_senha } = req.body;
    const solicitacaoId = req.params.id;
    if (!nova_senha || nova_senha.length < 6) {
        req.flash('error_msg', 'A nova senha deve ter no mínimo 6 caracteres');
        return res.redirect('/dashboard/solicitacoes-senha');
    }
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const solicitacao = await client.query(
            'SELECT * FROM solicitacoes_senha WHERE id = $1 AND status = $2',
            [solicitacaoId, 'PENDENTE']
        );
        if (solicitacao.rows.length === 0) {
            req.flash('error_msg', 'Solicitação não encontrada');
            return res.redirect('/dashboard/solicitacoes-senha');
        }
        const s = solicitacao.rows[0];
        await client.query(
            'UPDATE usuarios SET senha = $1 WHERE id = $2',
            [nova_senha, s.usuario_id]
        );
        await criarNotificacao(
            'senha_alterada',
            s.usuario_id,
            null,
            'Senha Redefinida',
            'Sua senha foi redefinida por um administrador',
            `/login`,
            'fas fa-check-circle',
            '#217346'
        );
        await client.query(
            `UPDATE solicitacoes_senha 
             SET status = 'APROVADA', data_resposta = CURRENT_TIMESTAMP, respondido_por = $1 
             WHERE id = $2`,
            [req.session.userId, solicitacaoId]
        );
        await client.query('COMMIT');
        req.flash('success_msg', 'Senha redefinida com sucesso!');
        res.redirect('/dashboard/solicitacoes-senha');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao aprovar solicitação:', err);
        req.flash('error_msg', 'Erro ao aprovar solicitação');
        res.redirect('/dashboard/solicitacoes-senha');
    } finally {
        client.release();
    }
};

exports.rejeitarSolicitacaoSenha = async (req, res) => {
    const { motivo } = req.body;
    const solicitacaoId = req.params.id;
    try {
        const solicitacao = await db.query(
            'SELECT * FROM solicitacoes_senha WHERE id = $1 AND status = $2',
            [solicitacaoId, 'PENDENTE']
        );
        if (solicitacao.rows.length === 0) {
            req.flash('error_msg', 'Solicitação não encontrada');
            return res.redirect('/dashboard/solicitacoes-senha');
        }
        const s = solicitacao.rows[0];
        await db.query(
            `UPDATE solicitacoes_senha 
             SET status = 'REJEITADA', data_resposta = CURRENT_TIMESTAMP, respondido_por = $1 
             WHERE id = $2`,
            [req.session.userId, solicitacaoId]
        );
        await criarNotificacao(
            'solicitacao_rejeitada',
            s.usuario_id,
            null,
            'Solicitação de Senha Rejeitada',
            motivo || 'Sua solicitação foi rejeitada. Contate o administrador.',
            `/login`,
            'fas fa-times-circle',
            '#ff0101'
        );
        req.flash('success_msg', 'Solicitação rejeitada');
        res.redirect('/dashboard/solicitacoes-senha');
    } catch (err) {
        console.error('Erro ao rejeitar solicitação:', err);
        req.flash('error_msg', 'Erro ao rejeitar solicitação');
        res.redirect('/dashboard/solicitacoes-senha');
    }
};