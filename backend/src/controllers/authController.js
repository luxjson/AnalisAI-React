const db = require('../db');
const { criarNotificacao } = require('../utils/notificacao');
const crypto = require('crypto');

exports.showHome = (req, res) => {
    res.json({ message: "AnalisAI API Home" });
};

exports.showTermos = (req, res) => {
    res.json({ message: "Página de Termos" });
};

exports.showManuais = (req, res) => {
    res.json({
        user: req.session.user || null,
        userCargo: req.session.userCargo || null,
        isAdmin: req.session.userCargo === 'Admin'
    });
};

exports.showManualDeUso = (req, res) => {
    res.json({
        user: req.session.user || null,
        userCargo: req.session.userCargo || null
    });
};

exports.showManualDoAluno = (req, res) => {
    res.json({
        user: req.session.user || null,
        userCargo: req.session.userCargo || null
    });
};

// ESSA FUNÇÃO ESTAVA FALTANDO E CAUSOU O ERRO NA LINHA 10
exports.showLogin = (req, res) => {
    res.json({
        message: "Endpoint de Login",
        tipo: req.query.tipo || 'professor'
    });
};

// ESSA TAMBÉM ESTAVA FALTANDO
exports.showEsqueciSenha = (req, res) => {
    res.json({ message: "Endpoint de Esqueci Senha" });
};

exports.loginProfessor = async (req, res) => {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) return res.status(400).json({ message: 'Preencha todos os campos' });

    try {
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [usuario.toLowerCase()]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'E-mail não encontrado' });

        const user = result.rows[0];
        if (user.status !== 'ATIVO') return res.status(403).json({ message: 'Conta inativa' });
        
        // Em produção use bcrypt.compare
        if (senha !== user.senha) return res.status(401).json({ message: 'Senha incorreta' });

        req.session.user = user.nome;
        req.session.userId = user.id;
        req.session.userCargo = user.cargo;

        await db.query("UPDATE usuarios SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);

        res.json({ success: true, user: { nome: user.nome, cargo: user.cargo, id: user.id } });
    } catch (err) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.loginAluno = async (req, res) => {
    let { matricula, email, senha } = req.body;
    try {
        let query = matricula ? 'SELECT * FROM alunos_login WHERE matricula = $1' : 'SELECT * FROM alunos_login WHERE email = $1';
        let params = [matricula ? matricula.toUpperCase() : email.toLowerCase()];
        
        const result = await db.query(query, params);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Aluno não encontrado' });

        const aluno = result.rows[0];
        if (senha !== aluno.senha) return res.status(401).json({ message: 'Senha incorreta' });

        const alunoDados = await db.query('SELECT * FROM alunos WHERE id = $1', [aluno.aluno_id]);
        const dados = alunoDados.rows[0];

        req.session.aluno = { id: dados.id, nome: dados.nome, ano_escolar: dados.ano_escolar };
        req.session.userCargo = 'Aluno';

        res.json({ success: true, user: req.session.aluno });
    } catch (err) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.json({ success: true });
};

exports.solicitarRedefinicaoSenha = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'E-mail é obrigatório' });
    }

    try {
        const result = await db.query('SELECT id, nome FROM usuarios WHERE email = $1', [email.toLowerCase()]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'E-mail não cadastrado no sistema.' });
        }

        const usuario = result.rows[0];
        const token = crypto.randomBytes(32).toString('hex');

        await db.query(
            `INSERT INTO solicitacoes_senha (usuario_id, email, token, status) VALUES ($1, $2, $3, 'PENDENTE')`,
            [usuario.id, email.toLowerCase(), token]
        );

        const admins = await db.query('SELECT id FROM usuarios WHERE cargo = $1', ['Admin']);
        for (const admin of admins.rows) {
            await criarNotificacao(
                'solicitacao_senha',
                admin.id,
                null,
                'Solicitação de Redefinição de Senha',
                `${usuario.nome} (${email}) solicitou redefinição de senha`,
                `/dashboard/solicitacoes-senha`,
                'fas fa-key',
                '#ff0101'
            );
        }

        return res.json({
            success: true,
            message: 'Solicitação enviada com sucesso! Um administrador irá analisar seu pedido.'
        });

    } catch (err) {
        console.error('Erro ao solicitar recuperação:', err);
        return res.status(500).json({ success: false, message: 'Erro ao processar sua solicitação.' });
    }
};