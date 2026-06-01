const db = require("../db");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

exports.dashboard = async (req, res) => {
  try {
    const alunosResult = await db.query(`
            SELECT 
                a.*,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'nota', ac.nota
                            )
                        )
                        FROM aluno_competencias ac
                        WHERE ac.aluno_id = a.id
                    ),
                    '[]'::json
                ) as competencias
            FROM alunos a
            ORDER BY a.nome ASC
        `);
    const alunos = alunosResult.rows;
    const alunosComNivel = alunos.map((aluno) => {
      let mediaCompetencias = 0;
      if (aluno.competencias && aluno.competencias.length > 0) {
        const soma = aluno.competencias.reduce(
          (acc, comp) => acc + parseFloat(comp.nota),
          0,
        );
        mediaCompetencias = soma / aluno.competencias.length;
      }
      let nivel = "EM DESENVOLVIMENTO";
      if (mediaCompetencias >= 7 && aluno.presenca >= 75) {
        nivel = "APTO";
      } else if (mediaCompetencias < 5 || aluno.presenca < 50) {
        nivel = "INAPTO";
      }
      return {
        ...aluno,
        nivel: nivel,
        media_competencias: mediaCompetencias.toFixed(1),
      };
    });
    const rankingGeralResult = await db.query(`
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
    const rankingMedioResult = await db.query(`
            SELECT 
                c.nome,
                COALESCE(AVG(ac.nota), 0) as media,
                COUNT(ac.id) as total_avaliacoes
            FROM competencias c
            LEFT JOIN aluno_competencias ac ON c.id = ac.competencia_id
            LEFT JOIN alunos a ON ac.aluno_id = a.id
            WHERE a.ano_escolar LIKE '%MÉDIO%'
            GROUP BY c.id, c.nome
            HAVING COUNT(ac.id) > 0
            ORDER BY media DESC
        `);
    const rankingFundamentalResult = await db.query(`
            SELECT 
                c.nome,
                COALESCE(AVG(ac.nota), 0) as media,
                COUNT(ac.id) as total_avaliacoes
            FROM competencias c
            LEFT JOIN aluno_competencias ac ON c.id = ac.competencia_id
            LEFT JOIN alunos a ON ac.aluno_id = a.id
            WHERE a.ano_escolar LIKE '%FUNDAMENTAL%'
            GROUP BY c.id, c.nome
            HAVING COUNT(ac.id) > 0
            ORDER BY media DESC
        `);
    const rankingGeral = rankingGeralResult.rows.map((item) => ({
      ...item,
      media: parseFloat(item.media) || 0,
    }));
    const rankingMedio = rankingMedioResult.rows.map((item) => ({
      ...item,
      media: parseFloat(item.media) || 0,
    }));
    const rankingFundamental = rankingFundamentalResult.rows.map((item) => ({
      ...item,
      media: parseFloat(item.media) || 0,
    }));
    res.json({
      user: req.session.user,
      alunos: alunosComNivel,
      rankingGeral: rankingGeral,
      rankingMedio: rankingMedio,
      rankingFundamental: rankingFundamental,
      userCargo: req.session.userCargo,
      isAdmin: req.session.userCargo === "Admin",
    });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Erro ao carregar dados do dashboard");
    res.json({
      user: req.session.user,
      alunos: [],
      rankingGeral: [],
      rankingMedio: [],
      rankingFundamental: [],
    });
  }
};

exports.editAlunos = async (req, res) => {
  try {
    const result = await db.query(`
            SELECT 
                a.*,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', nd.id,
                                'titulo', nd.titulo,
                                'descricao', nd.descricao,
                                'valor', nd.valor,
                                'data_criacao', nd.data_criacao
                            ) ORDER BY nd.id ASC
                        )
                        FROM notas_detalhadas nd
                        WHERE nd.aluno_id = a.id
                    ), 
                    '[]'::json
                ) as notas_individuais,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', ac.id,
                                'competencia_id', ac.competencia_id,
                                'nome', c.nome,
                                'descricao', c.descricao,
                                'categoria', c.categoria,
                                'nota', ac.nota,
                                'observacoes', ac.observacoes,
                                'data_registro', ac.data_registro
                            ) ORDER BY ac.id ASC
                        )
                        FROM aluno_competencias ac
                        JOIN competencias c ON ac.competencia_id = c.id
                        WHERE ac.aluno_id = a.id
                    ),
                    '[]'::json
                ) as competencias
            FROM alunos a
            ORDER BY a.id ASC
        `);
    const competenciasList = await db.query(`
            SELECT id, nome, descricao, categoria
            FROM competencias 
            ORDER BY id ASC
        `);
    res.json({
      alunos: result.rows,
      listaCompetencias: competenciasList.rows,
      user: req.session.user,
      userCargo: req.session.userCargo,
      isAdmin: req.session.userCargo === "Admin",
    });
  } catch (err) {
    console.error("ERRO NO DASHBOARD EDIT:", err);
    req.flash("error_msg", "Não foi possível carregar os dados");
    res.redirect("/dashboard");
  }
};

exports.graficos = async (req, res) => {
  try {
    const alunosResult = await db.query(`
            SELECT 
                a.*,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'nota', ac.nota
                            )
                        )
                        FROM aluno_competencias ac
                        WHERE ac.aluno_id = a.id
                    ),
                    '[]'::json
                ) as competencias
            FROM alunos a
        `);
    const alunos = alunosResult.rows;
    let total = 0;
    let apto = 0;
    let inapto = 0;
    let somaMedio = 0;
    let countMedio = 0;
    let somaFundamental = 0;
    let countFundamental = 0;
    alunos.forEach((aluno) => {
      total++;
      let mediaCompetencias = 0;
      if (aluno.competencias && aluno.competencias.length > 0) {
        const soma = aluno.competencias.reduce(
          (acc, comp) => acc + parseFloat(comp.nota),
          0,
        );
        mediaCompetencias = soma / aluno.competencias.length;
      }
      if (mediaCompetencias >= 7 && aluno.presenca >= 75) {
        apto++;
      } else if (mediaCompetencias < 5 || aluno.presenca < 50) {
        inapto++;
      }
      if (aluno.ano_escolar.includes("MÉDIO")) {
        somaMedio += mediaCompetencias;
        countMedio++;
      } else if (aluno.ano_escolar.includes("FUNDAMENTAL")) {
        somaFundamental += mediaCompetencias;
        countFundamental++;
      }
    });
    const stats = {
      total: total,
      apto: apto,
      inapto: inapto,
      mediaMedio: countMedio > 0 ? (somaMedio / countMedio).toFixed(1) : 0,
      mediaFundamental:
        countFundamental > 0
          ? (somaFundamental / countFundamental).toFixed(1)
          : 0,
    };
    res.json({
      stats,
      userCargo: req.session.userCargo,
      isAdmin: req.session.userCargo === "Admin",
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Erro ao carregar gráficos");
    res.json({
      stats: {
        total: 0,
        apto: 0,
        inapto: 0,
        mediaMedio: 0,
        mediaFundamental: 0,
      },
    });
  }
};

exports.equipe = (req, res) => {
  res.json("dashboard/dashboardEquipe");
};

exports.config = async (req, res) => {
  try {
    const aba = req.query.aba || "dados";
    const configResult = await db.query(
      `SELECT * FROM configuracoes_notificacoes WHERE usuario_id = $1`,
      [req.session.userId],
    );
    const config = configResult.rows[0] || {
      notificacoes_ativas: true,
      notificacoes_email: false,
      notificacoes_tarefas: true,
      notificacoes_avaliacoes: true,
      notificacoes_competencias: true,
    };
    
    const userResult = await db.query(
      "SELECT nome, email, cargo, data_criacao, ultimo_acesso FROM usuarios WHERE id = $1",
      [req.session.userId],
    );

    const user = userResult.rows[0];
    let ultimoAcessoFormatado = '---';
    if (user.ultimo_acesso) {
      ultimoAcessoFormatado = new Date(user.ultimo_acesso).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    const statsResult = await db.query(
      `
            SELECT 
                (SELECT COUNT(*) FROM tarefas WHERE criado_por = $1) as tarefas,
                (SELECT COUNT(DISTINCT aluno_id) FROM tarefas_alunos WHERE tarefa_id IN (SELECT id FROM tarefas WHERE criado_por = $1)) as alunos
        `,
      [req.session.userId],
    );
    res.json({
      config,
      user: req.session.user,
      nome: userResult.rows[0].nome,
      email: userResult.rows[0].email,
      cargo: userResult.rows[0].cargo,
      dataCadastro: new Date(
        userResult.rows[0].data_criacao,
      ).toLocaleDateString("pt-BR"),
      ultimoAcesso: ultimoAcessoFormatado,
      stats: statsResult.rows[0],
      abaAtiva: aba,
      userCargo: req.session.userCargo,
      isAdmin: req.session.userCargo === "Admin",
    });
  } catch (err) {
    console.error("Erro ao carregar configurações:", err);
    req.flash("error_msg", "Erro ao carregar configurações");
    res.redirect("/dashboard");
  }
};

exports.alterarSenha = async (req, res) => {
  const { senha_atual, nova_senha, confirmar_senha } = req.body;
  try {
    const result = await db.query("SELECT senha FROM usuarios WHERE id = $1", [
      req.session.userId,
    ]);
    if (result.rows.length === 0) {
      req.flash("error_msg", "Usuário não encontrado");
      return res.redirect("/dashboard/config?aba=senha");
    }
    const user = result.rows[0];
    if (senha_atual !== user.senha) {
      req.flash("error_msg", "Senha atual incorreta");
      return res.redirect("/dashboard/config?aba=senha");
    }
    if (nova_senha.length < 6) {
      req.flash("error_msg", "A nova senha deve ter no mínimo 6 caracteres");
      return res.redirect("/dashboard/config?aba=senha");
    }
    if (nova_senha !== confirmar_senha) {
      req.flash("error_msg", "As senhas não coincidem");
      return res.redirect("/dashboard/config?aba=senha");
    }
    await db.query("UPDATE usuarios SET senha = $1 WHERE id = $2", [
      nova_senha,
      req.session.userId,
    ]);
    req.flash("success_msg", "Senha alterada com sucesso!");
    res.redirect("/dashboard/config?aba=senha");
  } catch (err) {
    console.error("Erro ao alterar senha:", err);
    req.flash("error_msg", "Erro ao alterar senha");
    res.redirect("/dashboard/config?aba=senha");
  }
};

exports.alunoDados = async (req, res) => {
  try {
    const alunoId = req.params.id;
    const result = await db.query(
      `
            SELECT 
                a.id,
                a.nome,
                a.presenca,
                al.email,
                al.senha
            FROM alunos a
            LEFT JOIN alunos_login al ON a.id = al.aluno_id
            WHERE a.id = $1
        `,
      [alunoId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar dados do aluno:", err);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
};

exports.competenciasAluno = async (req, res) => {
  const alunoId = req.params.id;
  try {
    const result = await db.query(
      `
            SELECT 
                ac.*, 
                c.nome, 
                c.descricao as competencia_desc,
                c.categoria,
                TO_CHAR(ac.data_registro, 'DD/MM/YYYY') as data_formatada
            FROM aluno_competencias ac
            JOIN competencias c ON ac.competencia_id = c.id
            WHERE ac.aluno_id = $1
            ORDER BY ac.data_registro DESC
        `,
      [alunoId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar competências:", error);
    res.status(500).json({ error: "Erro ao buscar competências" });
  }
};

exports.adicionarCompetencia = async (req, res) => {
  const { aluno_id, competencia_id, nota, observacoes } = req.body;
  if (!aluno_id || !competencia_id || !nota) {
    req.flash(
      "error_msg",
      "Todos os campos obrigatórios devem ser preenchidos",
    );
    return res.redirect("/dashboard/edit");
  }
  if (nota < 0 || nota > 10) {
    req.flash("error_msg", "A nota deve estar entre 0 e 10");
    return res.redirect("/dashboard/edit");
  }
  try {
    await db.query(
      "INSERT INTO aluno_competencias (aluno_id, competencia_id, nota, observacoes) VALUES ($1, $2, $3, $4)",
      [aluno_id, competencia_id, nota, observacoes || null],
    );
    const { criarNotificacao } = require("../utils/notificacao");
    await criarNotificacao(
      "competencia",
      null,
      aluno_id,
      "Nova Competência",
      `Uma nova competência foi registrada: ${nota}`,
      `/aluno/competencias`,
      "fas fa-trophy",
      "#217346",
    );
    req.flash("success_msg", "Competência adicionada com sucesso!");
    res.redirect("/dashboard/edit");
  } catch (error) {
    console.error("Erro ao adicionar competência:", error);
    req.flash("error_msg", "Erro ao adicionar competência");
    res.redirect("/dashboard/edit");
  }
};

exports.deletarCompetencia = async (req, res) => {
  const compId = req.params.id;
  try {
    await db.query("DELETE FROM aluno_competencias WHERE id = $1", [compId]);
    req.flash("success_msg", "Competência removida com sucesso");
    res.redirect("/dashboard/edit");
  } catch (error) {
    console.error("Erro ao deletar competência:", error);
    req.flash("error_msg", "Erro ao deletar competência");
    res.redirect("/dashboard/edit");
  }
};

exports.atualizarPresenca = async (req, res) => {
  const { aluno_id, presenca } = req.body;
  try {
    await db.query("UPDATE alunos SET presenca = $1 WHERE id = $2", [
      presenca,
      aluno_id,
    ]);
    req.flash("success_msg", "Presença atualizada com sucesso!");
    res.redirect("/dashboard/edit");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Erro ao atualizar presença");
    res.redirect("/dashboard/edit");
  }
};

exports.addAluno = async (req, res) => {
  const { nome, ano_escolar, idade } = req.body;
  if (!nome || !ano_escolar || !idade) {
    req.flash("error_msg", "Todos os campos são obrigatórios");
    return res.redirect("/dashboard/edit");
  }
  try {
    const nomeLower = nome.toLowerCase().replace(/\s+/g, ".");
    const numeroAleatorio = Math.floor(Math.random() * 90 + 10);
    const email = `${nomeLower}${numeroAleatorio}@aluno.analisai.com`;
    const senha = "aluno123";
    const matricula = `alu${Date.now().toString().slice(-8)}`;
    const alunoResult = await db.query(
      `INSERT INTO alunos (nome, ano_escolar, idade, nota, presenca, nivel) 
             VALUES ($1, $2, $3, 0, 100, 'EM DESENVOLVIMENTO') RETURNING id`,
      [nome, ano_escolar, idade],
    );
    const alunoId = alunoResult.rows[0].id;
    await db.query(
      `INSERT INTO alunos_login (nome, email, senha, matricula, aluno_id, status) 
             VALUES ($1, $2, $3, $4, $5, 'ATIVO')`,
      [nome, email, senha, matricula, alunoId],
    );
    req.flash(
      "success_msg",
      `Aluno cadastrado com sucesso! Login: ${email} / Senha: ${senha}`,
    );
    res.redirect("/dashboard/edit");
  } catch (err) {
    console.error("Erro ao adicionar aluno:", err);
    if (err.code === "23505") {
      if (err.constraint === "alunos_login_email_key") {
        const nomeLower = nome.toLowerCase().replace(/\s+/g, ".");
        const timestamp = Date.now().toString().slice(-6);
        const emailAlternativo = `${nomeLower}.${timestamp}@aluno.analisai.com`;
        req.flash(
          "error_msg",
          `Email já existente. Tente novamente ou use: ${emailAlternativo}`,
        );
      } else if (err.constraint === "alunos_login_matricula_key") {
        req.flash("error_msg", "Matrícula já existente. Tente novamente.");
      } else {
        req.flash(
          "error_msg",
          "Email ou matrícula já existente. Tente novamente.",
        );
      }
    } else {
      req.flash("error_msg", "Erro ao adicionar aluno");
    }
    res.redirect("/dashboard/edit");
  }
};

exports.deleteAluno = async (req, res) => {
  const id = req.params.id;
  try {
    await db.query("DELETE FROM alunos WHERE id = $1", [id]);
    const checkEmpty = await db.query("SELECT COUNT(*) FROM alunos");
    if (parseInt(checkEmpty.rows[0].count) === 0) {
      await db.query("ALTER SEQUENCE alunos_id_seq RESTART WITH 1");
    } else {
      await db.query(
        "SELECT setval('alunos_id_seq', (SELECT MAX(id) FROM alunos))",
      );
    }
    req.flash("success_msg", "Aluno removido com sucesso!");
    res.redirect("/dashboard/edit");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Erro ao remover aluno");
    res.redirect("/dashboard/edit");
  }
};

exports.eraseAll = async (req, res) => {
  try {
    await db.query("TRUNCATE TABLE tarefas_alunos RESTART IDENTITY CASCADE");
    await db.query("TRUNCATE TABLE tarefas RESTART IDENTITY CASCADE");
    await db.query(
      "TRUNCATE TABLE aluno_competencias RESTART IDENTITY CASCADE",
    );
    await db.query("TRUNCATE TABLE notas_detalhadas RESTART IDENTITY CASCADE");
    await db.query("TRUNCATE TABLE alunos_login RESTART IDENTITY CASCADE");
    await db.query("TRUNCATE TABLE alunos RESTART IDENTITY CASCADE");
    req.flash("success_msg", "Todos os dados foram apagados com sucesso!");
    res.redirect("/dashboard/edit");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Erro ao apagar os dados");
    res.redirect("/dashboard/edit");
  }
};

exports.importarDados = async (req, res) => {
  try {
    const { alunos } = req.body;
    if (!alunos || !Array.isArray(alunos)) {
      return res.json({ sucesso: false, erro: "Dados inválidos" });
    }
    let importados = 0;
    let duplicados = 0;
    for (const aluno of alunos) {
      const existe = await db.query("SELECT id FROM alunos WHERE nome = $1", [
        aluno.nome,
      ]);
      if (existe.rows.length > 0) {
        duplicados++;
        continue;
      }
      const result = await db.query(
        `INSERT INTO alunos (nome, ano_escolar, idade, presenca, nivel) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          aluno.nome,
          aluno.ano_escolar,
          aluno.idade,
          aluno.presenca || 100,
          "EM DESENVOLVIMENTO",
        ],
      );
      const alunoId = result.rows[0].id;
      const nomeLower = aluno.nome.toLowerCase().replace(/\s+/g, ".");
      const numeroAleatorio = Math.floor(Math.random() * 90 + 10);
      const email = `${nomeLower}${numeroAleatorio}@aluno.analisai.com`;
      const senha = "aluno123";
      const matricula = `ALU${Date.now().toString().slice(-8)}${importados}`;
      await db.query(
        `INSERT INTO alunos_login (nome, email, senha, matricula, aluno_id, status) 
                 VALUES ($1, $2, $3, $4, $5, 'ATIVO')`,
        [aluno.nome, email, senha, matricula, alunoId],
      );
      importados++;
    }
    res.json({
      sucesso: true,
      importados,
      duplicados,
      mensagem: `${importados} alunos importados com sucesso! ${duplicados} duplicados ignorados.`,
    });
  } catch (err) {
    console.error("Erro na importação:", err);
    res.json({ sucesso: false, erro: err.message });
  }
};

exports.importarDadosCompletos = async (req, res) => {
  try {
    const { alunos } = req.body;
    if (!alunos || !Array.isArray(alunos)) {
      return res.json({ sucesso: false, erro: "Dados inválidos" });
    }
    let importados = 0;
    let duplicados = 0;
    let totalCompetencias = 0;
    for (const aluno of alunos) {
      const existe = await db.query("SELECT id FROM alunos WHERE nome = $1", [
        aluno.nome,
      ]);
      if (existe.rows.length > 0) {
        duplicados++;
        continue;
      }
      const result = await db.query(
        `INSERT INTO alunos (nome, ano_escolar, idade, presenca, nivel) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          aluno.nome,
          aluno.ano_escolar,
          aluno.idade,
          aluno.presenca || 100,
          "EM DESENVOLVIMENTO",
        ],
      );
      const alunoId = result.rows[0].id;
      const nomeLower = aluno.nome.toLowerCase().replace(/\s+/g, ".");
      const numeroAleatorio = Math.floor(Math.random() * 90 + 10);
      const email = `${nomeLower}${numeroAleatorio}@aluno.analisai.com`;
      const senha = "aluno123";
      const matricula = `ALU${Date.now().toString().slice(-8)}${importados}`;
      await db.query(
        `INSERT INTO alunos_login (nome, email, senha, matricula, aluno_id, status) 
                 VALUES ($1, $2, $3, $4, $5, 'ATIVO')`,
        [aluno.nome, email, senha, matricula, alunoId],
      );
      importados++;
      if (aluno.competencias && aluno.competencias.length > 0) {
        for (const comp of aluno.competencias) {
          const compResult = await db.query(
            "SELECT id FROM competencias WHERE nome = $1",
            [comp.nome],
          );
          if (compResult.rows.length > 0) {
            const competenciaId = compResult.rows[0].id;
            await db.query(
              "INSERT INTO aluno_competencias (aluno_id, competencia_id, nota, observacoes) VALUES ($1, $2, $3, $4)",
              [alunoId, competenciaId, comp.nota, "Importado via planilha"],
            );
            totalCompetencias++;
          }
        }
      }
    }
    res.json({
      sucesso: true,
      importados,
      duplicados,
      totalCompetencias,
      mensagem: `${importados} alunos importados com ${totalCompetencias} competências! ${duplicados} duplicados ignorados.`,
    });
  } catch (err) {
    console.error("Erro na importação:", err);
    res.json({ sucesso: false, erro: err.message });
  }
};

exports.baixarModeloImportacao = async (req, res) => {
  try {
    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Relatório AnalisAI");
    worksheet.columns = [
      { key: "A", width: 10 },
      { key: "B", width: 20 },
      { key: "C", width: 20 },
      { key: "D", width: 24 },
      { key: "E", width: 12 },
      { key: "F", width: 12 },
      { key: "G", width: 25 },
      { key: "H", width: 120 },
    ];
    try {
      const logoPath = path.join(
        process.cwd(),
        "public",
        "IMG",
        "xls-logo.png",
      );
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        const logoId = workbook.addImage({
          buffer: logoBuffer,
          extension: "png",
        });
        worksheet.addImage(logoId, {
          tl: { col: 0, row: 0 },
          br: { col: 3, row: 6 },
        });
      }
    } catch (e) {
      console.log("Logo não encontrado", e);
    }
    worksheet.mergeCells("D2:G4");
    const titleCell = worksheet.getCell("D2");
    titleCell.value = "MODELO DE IMPORTAÇÃO - PREENCHA OS DADOS";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFF0101" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    const headerRow = worksheet.getRow(8);
    headerRow.values = [
      "ID",
      "ALUNO",
      "ANO ESCOLAR",
      "IDADE",
      "MÉDIA",
      "PRESENÇA",
      "NÍVEL",
      "COMPETÊNCIAS",
    ];
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF0101" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    worksheet.addRow([
      "",
      "JOÃO SILVA",
      "1º MÉDIO",
      15,
      "",
      "90%",
      "",
      "Raciocínio Lógico: 8.5; Comunicação: 7.0",
    ]);
    worksheet.addRow([
      "",
      "MARIA OLIVEIRA",
      "2º MÉDIO",
      16,
      "",
      "85%",
      "",
      "Proatividade: 9.0; Organização: 6.5",
    ]);
    worksheet.addRow([
      "",
      "PEDRO SANTOS",
      "3º MÉDIO",
      17,
      "",
      "95%",
      "",
      "Liderança: 8.0; Trabalho em Equipe: 7.5",
    ]);
    worksheet.addRow([
      "",
      "ANA BEATRIZ",
      "9º FUNDAMENTAL",
      14,
      "",
      "100%",
      "",
      "Comunicação: 9.5; Criatividade: 8.0",
    ]);
    let currentRow = 8 + 5 + 2;
    const titleRow = worksheet.getRow(currentRow);
    titleRow.getCell(1).value = "INSTRUÇÕES DE PREENCHIMENTO:";
    titleRow.getCell(1).font = { bold: true, color: { argb: "FFFF0101" } };
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    currentRow++;
    const inst1 = worksheet.getRow(currentRow);
    inst1.getCell(1).value =
      "1. ID: Deixe em branco (será gerado automaticamente)";
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    currentRow++;
    const inst2 = worksheet.getRow(currentRow);
    inst2.getCell(1).value = "2. ALUNO: Nome completo (apenas letras)";
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    currentRow++;
    const inst3 = worksheet.getRow(currentRow);
    inst3.getCell(1).value =
      "3. ANO ESCOLAR: Use 1º MÉDIO, 2º MÉDIO, 3º MÉDIO ou 9º FUNDAMENTAL";
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    currentRow++;
    const inst4 = worksheet.getRow(currentRow);
    inst4.getCell(1).value = "4. IDADE: Número entre 10 e 20";
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    currentRow++;
    const inst5 = worksheet.getRow(currentRow);
    inst5.getCell(1).value =
      "5. MÉDIA: Deixe em branco (calculada automaticamente)";
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    currentRow++;
    const inst6 = worksheet.getRow(currentRow);
    inst6.getCell(1).value = "6. PRESENÇA: Número entre 0 e 100 (pode usar %)";
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    currentRow++;
    const inst7 = worksheet.getRow(currentRow);
    inst7.getCell(1).value =
      "7. NÍVEL: Deixe em branco (calculado automaticamente)";
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    currentRow++;
    const inst8 = worksheet.getRow(currentRow);
    inst8.getCell(1).value =
      '8. COMPETÊNCIAS: Formato "Competência: Nota; Competência: Nota"';
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    currentRow++;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=modelo_importacao_analisai.xlsx",
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao gerar modelo");
  }
};
