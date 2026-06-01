const db = require('../db');

exports.listar = async (req, res) => {
    try {
        const turmaFilter = req.query.turma || '';
        const mes = req.query.mes || new Date().getMonth() + 1;
        const ano = req.query.ano || new Date().getFullYear();
        
        let eventosQuery = `
            SELECT * FROM calendario_eventos 
            WHERE (EXTRACT(MONTH FROM data_inicio) = $1 OR EXTRACT(MONTH FROM data_fim) = $1)
            AND EXTRACT(YEAR FROM data_inicio) = $2
        `;
        const params = [mes, ano];
        
        if (turmaFilter) {
            eventosQuery += ` AND (turma = $3 OR turma IS NULL)`;
            params.push(turmaFilter);
        }
        
        eventosQuery += ` ORDER BY data_inicio ASC`;
        
        const eventosResult = await db.query(eventosQuery, params);
        const feriadosResult = await db.query(`
            SELECT * FROM feriados 
            WHERE (EXTRACT(MONTH FROM data) = $1 AND EXTRACT(YEAR FROM data) = $2)
            OR (recorrente = true AND EXTRACT(MONTH FROM data) = $1)
            ORDER BY 
                CASE 
                    WHEN EXTRACT(YEAR FROM data) = $2 THEN 0 
                    ELSE 1 
                END,
                data ASC
        `, [mes, ano]);
        
        const tiposResult = await db.query(`
            SELECT 
                tipo,
                COUNT(*) as total,
                MIN(cor) as cor
            FROM calendario_eventos 
            GROUP BY tipo
            ORDER BY total DESC
        `);
        
        res.json({
            user: req.session.user,
            userCargo: req.session.userCargo,
            eventos: eventosResult.rows,
            feriados: feriadosResult.rows,
            tipos: tiposResult.rows,
            filtros: {
                turma: turmaFilter,
                mes: parseInt(mes),
                ano: parseInt(ano)
            }
        });
    } catch (err) {
        console.error('Erro ao carregar calendário:', err);
        req.flash('error_msg', 'Erro ao carregar calendário');
        res.redirect('/dashboard');
    }
};

exports.criarEvento = async (req, res) => {
    const { titulo, descricao, tipo, data_inicio, data_fim, turma, cor } = req.body;
    
    if (!titulo || !data_inicio) {
        req.flash('error_msg', 'Título e data de início são obrigatórios');
        return res.redirect('/dashboard/calendario');
    }
    
    try {
        await db.query(
            `INSERT INTO calendario_eventos (titulo, descricao, tipo, data_inicio, data_fim, turma, cor, criado_por) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [titulo, descricao, tipo || 'evento', data_inicio, data_fim || null, turma || null, cor || '#ff0101', req.session.userId]
        );
        
        req.flash('success_msg', 'Evento adicionado com sucesso!');
        res.redirect('/dashboard/calendario');
    } catch (err) {
        console.error('Erro ao criar evento:', err);
        req.flash('error_msg', 'Erro ao criar evento');
        res.redirect('/dashboard/calendario');
    }
};

exports.criarFeriado = async (req, res) => {
    const { nome, data, recorrente } = req.body;
    
    if (!nome || !data) {
        req.flash('error_msg', 'Nome e data são obrigatórios');
        return res.redirect('/dashboard/calendario');
    }
    
    try {
        await db.query(
            `INSERT INTO feriados (nome, data, recorrente) 
             VALUES ($1, $2, $3)
             ON CONFLICT (data, nome) DO NOTHING`,
            [nome, data, recorrente === 'true']
        );
        
        req.flash('success_msg', 'Feriado adicionado com sucesso!');
        res.redirect('/dashboard/calendario');
    } catch (err) {
        console.error('Erro ao adicionar feriado:', err);
        req.flash('error_msg', 'Erro ao adicionar feriado');
        res.redirect('/dashboard/calendario');
    }
};

exports.deletarEvento = async (req, res) => {
    try {
        await db.query('DELETE FROM calendario_eventos WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Erro ao deletar evento:', err);
        res.status(500).json({ success: false });
    }
};

exports.deletarFeriado = async (req, res) => {
    try {
        await db.query('DELETE FROM feriados WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Erro ao deletar feriado:', err);
        res.status(500).json({ success: false });
    }
};

exports.dadosMes = async (req, res) => {
    try {
        const { mes, ano, turma } = req.query;
        
        const eventos = await db.query(`
            SELECT * FROM calendario_eventos 
            WHERE (EXTRACT(MONTH FROM data_inicio) = $1 OR EXTRACT(MONTH FROM data_fim) = $1)
            AND EXTRACT(YEAR FROM data_inicio) = $2
            AND (turma = $3 OR turma IS NULL)
            ORDER BY data_inicio ASC
        `, [mes, ano, turma || '']);
        
        const feriados = await db.query(
            'SELECT * FROM feriados WHERE EXTRACT(MONTH FROM data) = $1 AND EXTRACT(YEAR FROM data) = $2',
            [mes, ano]
        );
        
        res.json({
            eventos: eventos.rows,
            feriados: feriados.rows
        });
    } catch (err) {
        console.error('Erro ao buscar dados do calendário:', err);
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
};