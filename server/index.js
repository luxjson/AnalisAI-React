import express from 'express';
import cors from 'cors';
import pool from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session storage simples
const sessions = new Map();

// Helper functions
function getSession(req) {
  const sessionId = req.headers.cookie?.split('sessionId=')[1]?.split(';')[0];
  return sessions.get(sessionId);
}

async function criarNotificacao(tipo, usuarioId, alunoId, titulo, mensagem, link, icone = 'fas fa-bell', cor = '#ff0101') {
  try {
    await pool.query(
      `INSERT INTO notificacoes (usuario_id, aluno_id, tipo, titulo, mensagem, link, icone, cor) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [usuarioId || null, alunoId || null, tipo, titulo, mensagem, link, icone, cor]
    );
  } catch (err) {
    console.error('Erro ao criar notificação:', err);
  }
}

function checkAuth(req, res, next) {
  const session = getSession(req);
  if (session && session.user && session.userStatus === 'ATIVO') {
    req.session = session;
    next();
  } else {
    res.status(401).json({ error: 'Não autorizado' });
  }
}

function checkAdmin(req, res, next) {
  if (req.session.userCargo === 'Admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
}

function checkAlunoAuth(req, res, next) {
  const session = getSession(req);
  if (session && session.aluno) {
    req.session = session;
    next();
  } else {
    res.status(401).json({ error: 'Acesso de aluno necessário' });
  }
}

// ============== ROTAS PÚBLICAS ==============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Login Professor
app.post('/api/login/professor', async (req, res) => {
  const { usuario, senha } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [usuario]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'E-mail não encontrado' });
    }
    const user = result.rows[0];
    if (user.status !== 'ATIVO') {
      return res.status(401).json({ error: 'Conta inativa. Contate o administrador.' });
    }
    if (senha !== user.senha) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
    
    const sessionId = crypto.randomBytes(32).toString('hex');
    const session = {
      user: user.nome,
      userStatus: user.status,
      userId: user.id,
      userCargo: user.cargo
    };
    sessions.set(sessionId, session);
    
    res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({
      success: true,
      user: { id: user.id, nome: user.nome, email: user.email, cargo: user.cargo }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao conectar ao banco' });
  }
});

// Login Aluno
app.post('/api/login/aluno', async (req, res) => {
  const { matricula, email, senha } = req.body;
  
  try {
    let query, params;
    if (matricula) {
      query = 'SELECT * FROM alunos_login WHERE matricula = $1';
      params = [matricula];
    } else {
      query = 'SELECT * FROM alunos_login WHERE email = $1';
      params = [email];
    }
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Matrícula/E-mail não encontrado' });
    }
    
    const aluno = result.rows[0];
    if (aluno.status !== 'ATIVO') {
      return res.status(401).json({ error: 'Acesso bloqueado. Contate a secretaria.' });
    }
    if (senha !== aluno.senha) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
    
    const alunoDados = await pool.query(
      'SELECT id, nome, ano_escolar, presenca FROM alunos WHERE id = $1',
      [aluno.aluno_id]
    );
    
    if (alunoDados.rows.length === 0) {
      return res.status(404).json({ error: 'Dados do aluno não encontrados' });
    }
    
    const dados = alunoDados.rows[0];
    const sessionId = crypto.randomBytes(32).toString('hex');
    const session = {
      aluno: {
        id: aluno.aluno_id,
        nome: aluno.nome,
        matricula: aluno.matricula,
        ano_escolar: dados.ano_escolar,
        login_id: aluno.id
      }
    };
    sessions.set(sessionId, session);
    
    res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({
      success: true,
      aluno: session.aluno
    });
  } catch (err) {
    console.error('ERRO NO LOGIN DO ALUNO:', err);
    res.status(500).json({ error: 'Erro ao conectar ao banco' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  const sessionId = req.headers.cookie?.split('sessionId=')[1]?.split(';')[0];
  if (sessionId) sessions.delete(sessionId);
  res.clearCookie('sessionId');
  res.json({ success: true });
});

// Verificar sessão
app.get('/api/me', (req, res) => {
  const session = getSession(req);
  if (session?.user) {
    res.json({ type: 'professor', user: { nome: session.user, id: session.userId, cargo: session.userCargo } });
  } else if (session?.aluno) {
    res.json({ type: 'aluno', aluno: session.aluno });
  } else {
    res.status(401).json({ error: 'Não autenticado' });
  }
});

// ============== DASHBOARD PROFESSOR ==============
app.get('/api/dashboard', checkAuth, async (req, res) => {
  try {
    const alunosResult = await pool.query(`
      SELECT 
        a.*,
        COALESCE(
          (SELECT json_agg(json_build_object('nota', ac.nota))
           FROM aluno_competencias ac WHERE ac.aluno_id = a.id),
          '[]'::json
        ) as competencias
      FROM alunos a
      ORDER BY a.nome ASC
    `);
    
    const alunosComNivel = alunosResult.rows.map(aluno => {
      let mediaComp = 0;
      if (aluno.competencias && aluno.competencias.length > 0) {
        const soma = aluno.competencias.reduce((acc, comp) => acc + parseFloat(comp.nota), 0);
        mediaComp = soma / aluno.competencias.length;
      }
      let nivel = 'EM DESENVOLVIMENTO';
      if (mediaComp >= 7 && aluno.presenca >= 75) nivel = 'APTO';
      else if (mediaComp < 5 || aluno.presenca < 50) nivel = 'INAPTO';
      return { ...aluno, nivel, media_competencias: mediaComp.toFixed(1) };
    });
    
    // Ranking por competências
    const rankingResult = await pool.query(`
      SELECT 
        c.nome,
        COALESCE(AVG(ac.nota), 0) as media,
        COUNT(ac.id) as total_avaliacoes
      FROM competencias c
      LEFT JOIN aluno_competencias ac ON c.id = ac.competencia_id
      GROUP BY c.id, c.nome
      HAVING COUNT(ac.id) > 0
      ORDER BY media DESC
    `);
    
    res.json({ 
      alunos: alunosComNivel,
      ranking: rankingResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
});

// Gráficos e estatísticas
app.get('/api/graficos', checkAuth, async (req, res) => {
  try {
    const alunosResult = await pool.query(`
      SELECT 
        a.*,
        COALESCE(
          (SELECT json_agg(json_build_object('nota', ac.nota))
           FROM aluno_competencias ac WHERE ac.aluno_id = a.id),
          '[]'::json
        ) as competencias
      FROM alunos a
    `);
    
    const alunos = alunosResult.rows;
    let total = 0, apto = 0, inapto = 0;
    let somaMedio = 0, countMedio = 0;
    let somaFundamental = 0, countFundamental = 0;
    
    alunos.forEach(aluno => {
      total++;
      let mediaComp = 0;
      if (aluno.competencias && aluno.competencias.length > 0) {
        const soma = aluno.competencias.reduce((acc, comp) => acc + parseFloat(comp.nota), 0);
        mediaComp = soma / aluno.competencias.length;
      }
      if (mediaComp >= 7 && aluno.presenca >= 75) apto++;
      else if (mediaComp < 5 || aluno.presenca < 50) inapto++;
      
      if (aluno.ano_escolar?.includes('MÉDIO')) {
        somaMedio += mediaComp;
        countMedio++;
      } else if (aluno.ano_escolar?.includes('FUNDAMENTAL')) {
        somaFundamental += mediaComp;
        countFundamental++;
      }
    });
    
    res.json({
      total, apto, inapto,
      mediaMedio: countMedio > 0 ? (somaMedio / countMedio).toFixed(1) : 0,
      mediaFundamental: countFundamental > 0 ? (somaFundamental / countFundamental).toFixed(1) : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar gráficos' });
  }
});

// ============== ALUNOS (CRUD) ==============
app.get('/api/alunos', checkAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object('id', ac.id, 'competencia_id', ac.competencia_id, 'nome', c.nome, 'nota', ac.nota)
           )
           FROM aluno_competencias ac 
           JOIN competencias c ON ac.competencia_id = c.id 
           WHERE ac.aluno_id = a.id),
          '[]'::json
        ) as competencias
      FROM alunos a
      ORDER BY a.id ASC
    `);
    
    const competencias = await pool.query('SELECT id, nome, descricao, categoria FROM competencias ORDER BY id ASC');
    res.json({ alunos: result.rows, competencias: competencias.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar alunos' });
  }
});

app.post('/api/alunos', checkAuth, async (req, res) => {
  const { nome, ano_escolar, idade } = req.body;
  if (!nome || !ano_escolar || !idade) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  
  try {
    const nomeLower = nome.toLowerCase().replace(/\s+/g, '.');
    const numeroAleatorio = Math.floor(Math.random() * 90 + 10);
    const email = `${nomeLower}${numeroAleatorio}@aluno.analisai.com`;
    const senha = 'aluno123';
    const matricula = `ALU${Date.now().toString().slice(-8)}`;
    
    const alunoResult = await pool.query(
      `INSERT INTO alunos (nome, ano_escolar, idade, nota, presenca, nivel) 
       VALUES ($1, $2, $3, 0, 100, 'EM DESENVOLVIMENTO') RETURNING id`,
      [nome, ano_escolar, idade]
    );
    
    await pool.query(
      `INSERT INTO alunos_login (nome, email, senha, matricula, aluno_id, status) 
       VALUES ($1, $2, $3, $4, $5, 'ATIVO')`,
      [nome, email, senha, matricula, alunoResult.rows[0].id]
    );
    
    res.json({ success: true, message: `Aluno cadastrado! Login: ${email} / Senha: ${senha}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar aluno' });
  }
});

app.delete('/api/alunos/:id', checkAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM alunos WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover aluno' });
  }
});

app.put('/api/alunos/presenca', checkAuth, async (req, res) => {
  const { aluno_id, presenca } = req.body;
  try {
    await pool.query('UPDATE alunos SET presenca = $1 WHERE id = $2', [presenca, aluno_id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar presença' });
  }
});

// ============== COMPETÊNCIAS ==============
app.post('/api/competencias/aluno', checkAuth, async (req, res) => {
  const { aluno_id, competencia_id, nota, observacoes } = req.body;
  if (!aluno_id || !competencia_id || !nota) {
    return res.status(400).json({ error: 'Campos obrigatórios' });
  }
  if (nota < 0 || nota > 10) {
    return res.status(400).json({ error: 'Nota deve estar entre 0 e 10' });
  }
  
  try {
    await pool.query(
      'INSERT INTO aluno_competencias (aluno_id, competencia_id, nota, observacoes) VALUES ($1, $2, $3, $4)',
      [aluno_id, competencia_id, nota, observacoes || null]
    );
    
    // Atualizar média do aluno
    const mediaResult = await pool.query(
      'SELECT AVG(nota) as media FROM aluno_competencias WHERE aluno_id = $1',
      [aluno_id]
    );
    if (mediaResult.rows[0].media) {
      await pool.query('UPDATE alunos SET nota = $1 WHERE id = $2', [mediaResult.rows[0].media, aluno_id]);
    }
    
    await criarNotificacao('competencia', null, aluno_id, 'Nova Competência', `Nota: ${nota}`, '/aluno/competencias');
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar competência' });
  }
});

app.delete('/api/competencias/:id', checkAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM aluno_competencias WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar competência' });
  }
});

// ============== TAREFAS ==============
app.get('/api/tarefas', checkAuth, async (req, res) => {
  try {
    const { turma, status } = req.query;
    let query = `
      SELECT 
        t.*,
        u.nome as professor_nome,
        COUNT(ta.id) as total_alunos,
        COUNT(CASE WHEN ta.status = 'CONCLUIDA' THEN 1 END) as concluidas,
        COUNT(CASE WHEN ta.status = 'ENTREGUE' THEN 1 END) as entregues,
        COUNT(CASE WHEN ta.status = 'DEVOLVIDA' THEN 1 END) as devolvidas
      FROM tarefas t
      LEFT JOIN usuarios u ON t.criado_por = u.id
      LEFT JOIN tarefas_alunos ta ON t.id = ta.tarefa_id
      WHERE 1=1
    `;
    const params = [];
    if (turma) { params.push(turma); query += ` AND t.turma = $${params.length}`; }
    if (status) { params.push(status); query += ` AND t.status = $${params.length}`; }
    query += ` GROUP BY t.id, u.nome ORDER BY t.data_criacao DESC`;
    
    const tarefas = await pool.query(query, params);
    const alunos = await pool.query('SELECT id, nome, ano_escolar FROM alunos ORDER BY nome');
    const competencias = await pool.query('SELECT id, nome FROM competencias ORDER BY nome');
    
    // Estatísticas
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'ATIVA' THEN 1 END) as ativas,
        COUNT(CASE WHEN data_entrega < CURRENT_DATE AND status = 'ATIVA' THEN 1 END) as atrasadas,
        (SELECT COUNT(*) FROM tarefas_alunos WHERE status = 'ENTREGUE') as aguardando_correcao
      FROM tarefas
    `);
    
    res.json({ 
      tarefas: tarefas.rows, 
      alunos: alunos.rows, 
      competencias: competencias.rows,
      stats: stats.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar tarefas' });
  }
});

app.post('/api/tarefas', checkAuth, async (req, res) => {
  const { titulo, descricao, turma, data_entrega, prioridade, alunos, competencia_id } = req.body;
  if (!titulo || !turma) {
    return res.status(400).json({ error: 'Título e turma são obrigatórios' });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tarefaResult = await client.query(
      `INSERT INTO tarefas (titulo, descricao, turma, data_entrega, prioridade, competencia_id, criado_por, data_atualizacao) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING id`,
      [titulo, descricao, turma, data_entrega || null, prioridade || 'MEDIA', competencia_id || null, req.session.userId]
    );
    
    const tarefaId = tarefaResult.rows[0].id;
    let alunosLista = alunos;
    
    if (!alunosLista || alunosLista.length === 0) {
      const alunosTurma = await client.query('SELECT id FROM alunos WHERE ano_escolar = $1', [turma]);
      alunosLista = alunosTurma.rows.map(a => a.id);
    }
    
    for (const alunoId of alunosLista) {
      await client.query(
        `INSERT INTO tarefas_alunos (tarefa_id, aluno_id, status) VALUES ($1, $2, 'PENDENTE')`,
        [tarefaId, alunoId]
      );
      await criarNotificacao('tarefa', null, alunoId, 'Nova Tarefa', titulo, '/aluno/tarefas');
    }
    
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  } finally {
    client.release();
  }
});

app.put('/api/tarefas/:id', checkAuth, async (req, res) => {
  const { titulo, descricao, data_entrega, prioridade, status } = req.body;
  try {
    await pool.query(
      `UPDATE tarefas 
       SET titulo = $1, descricao = $2, data_entrega = $3, prioridade = $4, status = $5, data_atualizacao = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [titulo, descricao, data_entrega || null, prioridade, status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao editar tarefa' });
  }
});

app.delete('/api/tarefas/:id', checkAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM tarefas WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir tarefa' });
  }
});

// Avaliar tarefa do aluno
app.post('/api/tarefas/avaliar', checkAuth, async (req, res) => {
  const { tarefa_id, aluno_id, nota, feedback } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE tarefas_alunos 
       SET nota = $1, feedback = $2, status = 'CONCLUIDA', data_avaliacao = CURRENT_TIMESTAMP
       WHERE tarefa_id = $3 AND aluno_id = $4`,
      [nota, feedback, tarefa_id, aluno_id]
    );
    
    const tarefa = await client.query('SELECT competencia_id FROM tarefas WHERE id = $1', [tarefa_id]);
    let virouCompetencia = false;
    
    if (tarefa.rows[0].competencia_id) {
      await client.query(
        `INSERT INTO aluno_competencias (aluno_id, competencia_id, nota, observacoes)
         VALUES ($1, $2, $3, $4)`,
        [aluno_id, tarefa.rows[0].competencia_id, nota, `Avaliado via tarefa ID ${tarefa_id}`]
      );
      virouCompetencia = true;
      
      const media = await client.query(
        'SELECT AVG(nota) as media FROM aluno_competencias WHERE aluno_id = $1',
        [aluno_id]
      );
      if (media.rows[0].media) {
        await client.query('UPDATE alunos SET nota = $1 WHERE id = $2', [media.rows[0].media, aluno_id]);
      }
    }
    
    await criarNotificacao('avaliacao', null, aluno_id, 'Tarefa Avaliada', `Nota: ${nota}`, '/aluno/tarefas');
    await client.query('COMMIT');
    res.json({ success: true, virouCompetencia });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ============== USUÁRIOS (Admin) ==============
app.get('/api/usuarios', checkAuth, checkAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, email, cargo, status FROM usuarios ORDER BY nome');
    res.json({ usuarios: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar usuários' });
  }
});

app.post('/api/usuarios', checkAuth, checkAdmin, async (req, res) => {
  const { nome, email, senha, cargo } = req.body;
  try {
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha, cargo, status) VALUES ($1, $2, $3, $4, $5)',
      [nome, email, senha, cargo, 'ATIVO']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

app.put('/api/usuarios/:id', checkAuth, checkAdmin, async (req, res) => {
  const { nome, email, cargo, status } = req.body;
  try {
    await pool.query(
      'UPDATE usuarios SET nome=$1, email=$2, cargo=$3, status=$4 WHERE id=$5',
      [nome, email, cargo, status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

app.delete('/api/usuarios/:id', checkAuth, checkAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

// ============== NOTIFICAÇÕES ==============
app.get('/api/notificacoes', async (req, res) => {
  const session = getSession(req);
  try {
    let query, params;
    if (session?.aluno) {
      query = `SELECT * FROM notificacoes WHERE aluno_id = $1 AND lida = false ORDER BY data_criacao DESC LIMIT 20`;
      params = [session.aluno.id];
    } else if (session?.user) {
      query = `SELECT * FROM notificacoes WHERE usuario_id = $1 AND lida = false ORDER BY data_criacao DESC LIMIT 20`;
      params = [session.userId];
    } else {
      return res.json({ notificacoes: [], totalNaoLidas: 0 });
    }
    const result = await pool.query(query, params);
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM notificacoes WHERE ${session.aluno ? 'aluno_id' : 'usuario_id'} = $1 AND lida = false`,
      [session.aluno ? session.aluno.id : session.userId]
    );
    res.json({ notificacoes: result.rows, totalNaoLidas: parseInt(countResult.rows[0].total) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

app.put('/api/notificacoes/:id', async (req, res) => {
  const session = getSession(req);
  try {
    let query, params;
    if (session?.aluno) {
      query = `UPDATE notificacoes SET lida = true WHERE id = $1 AND aluno_id = $2 RETURNING id`;
      params = [req.params.id, session.aluno.id];
    } else if (session?.user) {
      query = `UPDATE notificacoes SET lida = true WHERE id = $1 AND usuario_id = $2 RETURNING id`;
      params = [req.params.id, session.userId];
    } else {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const result = await pool.query(query, params);
    res.json({ success: result.rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar' });
  }
});


app.put('/api/notificacoes/marcar-todas', async (req, res) => {
  const session = getSession(req);
  try {
    if (session?.aluno) {
      await pool.query('UPDATE notificacoes SET lida = true WHERE aluno_id = $1 AND lida = false', [session.aluno.id]);
    } else if (session?.user) {
      await pool.query('UPDATE notificacoes SET lida = true WHERE usuario_id = $1 AND lida = false', [session.userId]);
    } else {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar' });
  }
});

// ============== ROTAS DO ALUNO ==============
app.get('/api/aluno/dashboard', checkAlunoAuth, async (req, res) => {
  try {
    const alunoId = req.session.aluno.id;
    const alunoResult = await pool.query(`
      SELECT 
        a.*,
        al.matricula,
        al.email,
        al.status,
        TO_CHAR(al.data_criacao, 'DD/MM/YYYY') as data_cadastro
      FROM alunos a
      JOIN alunos_login al ON a.id = al.aluno_id
      WHERE a.id = $1
    `, [alunoId]);
    
    const competenciasResult = await pool.query(`
      SELECT 
        ac.*,
        c.nome,
        c.descricao,
        c.categoria,
        TO_CHAR(ac.data_registro, 'DD/MM/YYYY') as data_formatada
      FROM aluno_competencias ac
      JOIN competencias c ON ac.competencia_id = c.id
      WHERE ac.aluno_id = $1
      ORDER BY ac.data_registro DESC
    `, [alunoId]);
    
    // Calcular média geral
    let mediaGeral = 0;
    if (competenciasResult.rows.length > 0) {
      const soma = competenciasResult.rows.reduce((acc, comp) => acc + parseFloat(comp.nota), 0);
      mediaGeral = soma / competenciasResult.rows.length;
    }
    
    // Categorias
    const categoriasMap = new Map();
    competenciasResult.rows.forEach(comp => {
      if (!categoriasMap.has(comp.categoria)) {
        categoriasMap.set(comp.categoria, { categoria: comp.categoria, soma: 0, count: 0 });
      }
      const cat = categoriasMap.get(comp.categoria);
      cat.soma += parseFloat(comp.nota);
      cat.count++;
    });
    const categorias = Array.from(categoriasMap.values()).map(cat => ({
      ...cat,
      media: (cat.soma / cat.count) * 10
    }));
    
    res.json({
      aluno: alunoResult.rows[0],
      competencias: competenciasResult.rows,
      mediaGeral: mediaGeral.toFixed(1),
      categorias
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
});

app.get('/api/aluno/competencias', checkAlunoAuth, async (req, res) => {
  try {
    const alunoId = req.session.aluno.id;
    const alunoResult = await pool.query('SELECT nome, ano_escolar FROM alunos WHERE id = $1', [alunoId]);
    const competenciasResult = await pool.query(`
      SELECT 
        ac.*,
        c.nome,
        c.descricao,
        c.categoria,
        TO_CHAR(ac.data_registro, 'DD/MM/YYYY') as data_formatada
      FROM aluno_competencias ac
      JOIN competencias c ON ac.competencia_id = c.id
      WHERE ac.aluno_id = $1
      ORDER BY ac.data_registro DESC
    `, [alunoId]);
    
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE nota >= 7) as aptas,
        COUNT(*) FILTER (WHERE nota >= 5 AND nota < 7) as desenvolvimento,
        COUNT(*) FILTER (WHERE nota < 5) as inaptas,
        COALESCE(AVG(nota), 0) as media_geral
      FROM aluno_competencias
      WHERE aluno_id = $1
    `, [alunoId]);
    
    res.json({
      aluno: alunoResult.rows[0],
      competencias: competenciasResult.rows,
      stats: stats.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar competências' });
  }
});

app.get('/api/aluno/tarefas', checkAlunoAuth, async (req, res) => {
  try {
    const alunoId = req.session.aluno.id;
    const tarefasResult = await pool.query(`
      SELECT 
        ta.id as tarefa_aluno_id,
        t.id as tarefa_id,
        t.titulo,
        t.descricao,
        t.turma,
        t.data_entrega as data_limite,
        c.nome as competencia_nome,
        ta.status,
        ta.nota,
        ta.feedback,
        ta.data_entrega as data_entrega_aluno,
        ta.data_avaliacao,
        TO_CHAR(t.data_entrega, 'DD/MM/YYYY') as data_limite_formatada,
        TO_CHAR(ta.data_entrega, 'DD/MM/YYYY HH24:MI') as data_entrega_formatada,
        CASE 
          WHEN ta.status = 'PENDENTE' AND t.data_entrega < CURRENT_DATE THEN 'ATRASADA'
          ELSE ta.status
        END as status_real
      FROM tarefas t
      JOIN tarefas_alunos ta ON t.id = ta.tarefa_id
      LEFT JOIN competencias c ON t.competencia_id = c.id
      WHERE ta.aluno_id = $1
      ORDER BY 
        CASE 
          WHEN ta.status = 'PENDENTE' AND t.data_entrega < CURRENT_DATE THEN 1
          WHEN ta.status = 'PENDENTE' THEN 2
          ELSE 3
        END,
        t.data_entrega ASC NULLS LAST
    `, [alunoId]);
    
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'PENDENTE' THEN 1 END) as pendentes,
        COUNT(CASE WHEN status = 'ENTREGUE' THEN 1 END) as aguardando,
        COUNT(CASE WHEN status = 'CONCLUIDA' THEN 1 END) as concluidas,
        COUNT(CASE WHEN status = 'DEVOLVIDA' THEN 1 END) as devolvidas
      FROM tarefas_alunos
      WHERE aluno_id = $1
    `, [alunoId]);
    
    res.json({
      tarefas: tarefasResult.rows,
      stats: stats.rows[0],
      aluno: req.session.aluno
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar tarefas' });
  }
});

// ============== INICIAR SERVIDOR ==============
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api/health`);
});