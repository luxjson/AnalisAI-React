import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarProfessor from '../../components/layout/SidebarProfessor';
import useExternalStyle from '../../hooks/useExternalStyle';
import Chart from 'chart.js/auto';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export default function DashboardEditor({ 
    user = "Usuário", 
    userCargo = "Professor", 
    alunos = [], 
    listaCompetencias = [],
    success_msg = "",
    error_msg = ""
}) {
    useExternalStyle('sidebar.css', 'dashboard.css', 'edit.css');
    const navigate = useNavigate();
    const isAdmin = userCargo === 'Admin';

    // --- ESTADOS DE INTERFACE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [compSearchTerm, setCompSearchTerm] = useState('');
    const [chartSearchTerm, setChartSearchTerm] = useState('');
    const [filterAno, setFilterAno] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // --- ESTADOS DE MODAIS ---
    const [modalFilter, setModalFilter] = useState(false);
    const [modalAdd, setModalAdd] = useState(false);
    const [modalImport, setModalImport] = useState(false);
    const [modalPreview, setModalPreview] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);
    const [modalExportSuccess, setModalExportSuccess] = useState(false);
    const [modalEraseAll, setModalEraseAll] = useState(false);
    const [modalError, setModalError] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // --- ESTADOS DE DADOS ---
    const [editTab, setEditTab] = useState('info');
    const [selectedAluno, setSelectedAluno] = useState(null);
    const [alunosParaImportar, setAlunosParaImportar] = useState([]);
    const [importProgress, setImportProgress] = useState(0);
    const [loadingStatusText, setLoadingStatusText] = useState('0% concluído');
    const [errorModalContent, setErrorModalContent] = useState({ titulo: '', mensagem: '', detalhe: '' });

    const chartRefs = useRef({});

    // --- LÓGICA DE CÁLCULO DE NÍVEL (IGUAL AO EJS) ---
    const getAlunoStatus = (aluno) => {
        let mediaCompetencias = 0;
        const temCompetencias = aluno.competencias && aluno.competencias.length > 0;
        
        if (temCompetencias) {
            const soma = aluno.competencias.reduce((acc, comp) => acc + parseFloat(comp.nota), 0);
            mediaCompetencias = soma / aluno.competencias.length;
        }
        
        let nivelReal = 'EM DESENVOLVIMENTO';
        let nivelClass = 'em-desenvolvimento';
        
        if (mediaCompetencias >= 7 && aluno.presenca >= 75) {
            nivelReal = 'APTO';
            nivelClass = 'apto';
        } else if (mediaCompetencias < 5 || aluno.presenca < 50) {
            nivelReal = 'INAPTO';
            nivelClass = 'inapto';
        }
        return { nivelReal, nivelClass, media: mediaCompetencias, temCompetencias };
    };

    // --- GRÁFICOS (CHART.JS) ---
    useEffect(() => {
        alunos.forEach(aluno => {
            const status = getAlunoStatus(aluno);
            if (status.temCompetencias) {
                const canvasId = `chart-${aluno.id}`;
                const ctx = document.getElementById(canvasId);
                if (ctx) {
                    if (chartRefs.current[canvasId]) chartRefs.current[canvasId].destroy();

                    chartRefs.current[canvasId] = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: aluno.competencias.map(c => c.nome.substring(0, 10)),
                            datasets: [{
                                label: 'Nota',
                                data: aluno.competencias.map(c => parseFloat(c.nota)),
                                backgroundColor: aluno.competencias.map(c => 
                                    c.nota >= 7 ? 'rgba(0, 255, 0, 0.5)' : 
                                    c.nota >= 5 ? 'rgba(255, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)'
                                ),
                                borderColor: '#ff0101',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: { beginAtZero: true, max: 10, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
                                x: { grid: { display: false }, ticks: { color: '#888', maxRotation: 45, minRotation: 45 } }
                            },
                            plugins: { legend: { display: false } }
                        }
                    });
                }
            }
        });
    }, [alunos, searchTerm, filterAno, filterStatus, chartSearchTerm]);

    // --- EXPORTAR EXCEL (EXCELJS COMPLETO) ---
    const exportarTabelaParaExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Relatório AnalisAI');

        worksheet.columns = [
            { key: 'A', width: 10 }, { key: 'B', width: 20 }, { key: 'C', width: 20 },
            { key: 'D', width: 24 }, { key: 'E', width: 12 }, { key: 'F', width: 12 },
            { key: 'G', width: 25 }, { key: 'H', width: 120 }
        ];

        // Título
        worksheet.mergeCells('D2:G4');
        const titleCell = worksheet.getCell('D2');
        titleCell.value = 'RELATÓRIO GERAL DE DESEMPENHO POR COMPETÊNCIA';
        titleCell.font = { size: 16, bold: true, color: { argb: 'FFFF0101' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // Cabeçalho Tabela
        const headerRow = worksheet.getRow(8);
        headerRow.values = ['ID', 'ALUNO', 'ANO ESCOLAR', 'IDADE', 'MÉDIA', 'PRESENÇA', 'NÍVEL', 'COMPETÊNCIAS'];
        headerRow.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0101' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Dados
        alunos.forEach((aluno, index) => {
            const status = getAlunoStatus(aluno);
            const compStr = aluno.competencias?.map(c => `${c.nome}: ${c.nota}`).join('; ') || 'Sem competências';
            worksheet.addRow([
                aluno.id, aluno.nome, aluno.ano_escolar, aluno.idade,
                status.media.toFixed(1), aluno.presenca + '%', status.nivelReal, compStr
            ]);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Relatorio_Completo_AnalisAI.xlsx`);
        setModalExportSuccess(true);
    };

    // --- IMPORTAR PLANILHA (SHEETJS COMPLETO) ---
    const processarPlanilha = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

                let linhaAlunos = -1;
                for (let i = 0; i < Math.min(30, rows.length); i++) {
                    if (rows[i] && rows[i][0] === 'ID' && rows[i][1] === 'ALUNO') {
                        linhaAlunos = i;
                        break;
                    }
                }

                if (linhaAlunos === -1) throw new Error("Formato de planilha inválido.");

                const lista = [];
                for (let i = linhaAlunos + 1; i < rows.length; i++) {
                    const r = rows[i];
                    if (!r || !r[1] || String(r[0]).includes('HISTÓRICO')) break;
                    lista.push({
                        nome: String(r[1]).toUpperCase(),
                        ano_escolar: r[2],
                        idade: r[3],
                        presenca: parseInt(String(r[5]).replace('%', '')) || 100,
                        competencias: [] // Simplificado
                    });
                }
                setAlunosParaImportar(lista);
                setModalImport(false);
                setModalPreview(true);
            } catch (err) {
                setErrorModalContent({ titulo: 'ERRO', mensagem: err.message, detalhe: '' });
                setModalError(true);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // --- FILTROS DE RENDERIZAÇÃO ---
    const filteredAlunos = alunos.filter(aluno => {
        const status = getAlunoStatus(aluno);
        const matchesName = aluno.nome.toUpperCase().includes(searchTerm.toUpperCase());
        const matchesAno = filterAno === "" || aluno.ano_escolar === filterAno;
        const matchesStatus = filterStatus === "" || status.nivelReal === filterStatus;
        return matchesName && matchesAno && matchesStatus;
    });

    return (
        <div className="dash-body">
            <SidebarProfessor userCargo={userCargo} />

            <div className="main-layout">
                <header className="dash-header">
                    <div className="header-left"><h1>Editor de Notas</h1></div>
                    <div className="header-user">
                        <div className="user-profile-group">
                            <div className="user-details">
                                <span className="user-name"><strong>{user}</strong></span>
                                <br />
                                <span className="user-role" style={{ color: '#888888' }}><strong>{userCargo}</strong></span>
                            </div>
                        </div>
                        <div className="header-actions"><div className="header-icon"><i className="fas fa-bell"></i></div></div>
                    </div>
                </header>

                {success_msg && <div className="alert alert-success">{success_msg}</div>}
                {error_msg && <div className="alert alert-error">{error_msg}</div>}

                <div className="toolbar">
                    <div className="action-buttons">
                        <button className="btn-icon btn-filter" onClick={() => setModalFilter(true)} title="Filtrar"><i className="fas fa-filter"></i></button>
                        <button className="btn-secondary-dash" onClick={() => setModalAdd(true)} title="Adicionar Aluno"><i className="fas fa-plus"></i> ADICIONAR ALUNO</button>
                        <button className="btn-secondary-dash" onClick={() => setModalImport(true)} title="Importar Planilha"><i className="fas fa-file-import"></i> IMPORTAR TABELA</button>
                        <button className="btn-secondary-dash" onClick={exportarTabelaParaExcel} title="Exportar Tabela"><i className="fas fa-file-export"></i> EXPORTAR TABELA</button>
                        {isAdmin && <button className="btn-icon btn-erase" onClick={() => setModalEraseAll(true)} title="Apagar Tudo"><span className="material-symbols-outlined">delete</span></button>}
                    </div>
                    <div className="search-container">
                        <i className="fas fa-search"></i>
                        <input type="text" placeholder="Pesquisar aluno..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <main className="edit-content">
                    {/* TABELA PRINCIPAL */}
                    <div className="table-container">
                        <table className="alunos-table">
                            <thead>
                                <tr><th>ID</th><th>ALUNO</th><th>ANO ESCOLAR</th><th>IDADE</th><th>MÉDIA</th><th>PRESENÇA</th><th>NÍVEL</th><th>AÇÕES</th></tr>
                            </thead>
                            <tbody>
                                {filteredAlunos.map(aluno => {
                                    const status = getAlunoStatus(aluno);
                                    return (
                                        <tr key={aluno.id}>
                                            <td>{aluno.id}</td>
                                            <td>{aluno.nome}</td>
                                            <td>{aluno.ano_escolar}</td>
                                            <td>{aluno.idade}</td>
                                            <td className="media-notas">
                                                <strong>{status.media.toFixed(1)}</strong>
                                                <small style={{ color: '#888', display: 'block' }}>({aluno.competencias?.length || 0} comp.)</small>
                                            </td>
                                            <td>{aluno.presenca}%</td>
                                            <td className={`status ${status.nivelClass}`}>{status.nivelReal}</td>
                                            <td className="td-actions">
                                                <button className="btn-table-edit" onClick={() => { setSelectedAluno(aluno); setModalEdit(true); setEditTab('info'); }}><i className="fa-solid fa-pen"></i></button>
                                                <button className="delete-link" style={{ background: 'none', border: 'none' }}><span className="material-symbols-outlined">delete</span></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* SEÇÃO COMPETÊNCIAS */}
                    <div className="competencias-section">
                        <h2 className="section-title-2">COMPETÊNCIAS POR ALUNO</h2>
                        <div className="search-container" style={{maxWidth:'400px', marginBottom:'25px'}}>
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Procurar aluno..." onChange={(e) => setCompSearchTerm(e.target.value.toLowerCase())} />
                        </div>
                        <div className="competencias-grid">
                            {alunos.filter(a => a.nome.toLowerCase().includes(compSearchTerm)).map(aluno => (
                                aluno.competencias?.length > 0 && (
                                    <div className="competencia-card" key={aluno.id}>
                                        <div className="competencia-header"><h3>{aluno.nome}</h3><span className="competencia-ano">{aluno.ano_escolar}</span></div>
                                        <div className="competencia-list">
                                            {aluno.competencias.map((c, i) => (
                                                <div className="competencia-item" key={i}>
                                                    <div className="competencia-info"><span className="competencia-nome">{c.nome}</span></div>
                                                    <span className={`competencia-nota ${c.nota >= 7 ? 'apto' : c.nota >= 5 ? 'desenvolvimento' : 'inapto'}`}>{parseFloat(c.nota).toFixed(1)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* SEÇÃO GRÁFICOS */}
                    <div className="evolution-container">
                        <h2 className="section-title-2">EVOLUÇÃO INDIVIDUAL</h2>
                        <div className="search-container" style={{maxWidth:'400px', marginBottom:'25px'}}>
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Procurar gráfico..." onChange={(e) => setChartSearchTerm(e.target.value.toLowerCase())} />
                        </div>
                        <div className="charts-grid">
                            {alunos.filter(a => a.nome.toLowerCase().includes(chartSearchTerm)).map(aluno => (
                                aluno.competencias?.length > 0 && (
                                    <div className="chart-card" key={aluno.id}>
                                        <h3>ALUNO: {aluno.nome}</h3>
                                        <div className="chart-wrapper" style={{ position: 'relative', height: '300px' }}>
                                            <canvas id={`chart-${aluno.id}`}></canvas>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </main>

                <footer className="dash-footer">
                    <button className="btn-secondary-dash" onClick={exportarTabelaParaExcel}><i className="fas fa-file-export"></i> EXPORTAR PLANILHA COMPLETA</button>
                    <div className="footer-credits"><p>© 2026 AnalisAI</p></div>
                </footer>
            </div>

            {/* --- TODOS OS MODAIS --- */}

            {/* Modal Filtro */}
            {modalFilter && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setModalFilter(false)}><i className="fas fa-times-circle"></i></button>
                        <h2 className="section-title-2">FILTRAR LISTA</h2>
                        <div className="filter-options">
                            <label>ANO ESCOLAR:</label>
                            <select className="filter-input" value={filterAno} onChange={(e) => setFilterAno(e.target.value)}>
                                <option value="">TODOS OS ANOS</option>
                                <option value="1º MÉDIO">1º MÉDIO</option>
                                <option value="2º MÉDIO">2º MÉDIO</option>
                                <option value="3º MÉDIO">3º MÉDIO</option>
                                <option value="9º FUNDAMENTAL">9º FUNDAMENTAL</option>
                            </select>
                            <label style={{ marginTop: '15px', display: 'block' }}>STATUS:</label>
                            <select className="filter-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="">TODOS OS NÍVEIS</option>
                                <option value="APTO">APTO</option>
                                <option value="INAPTO">INAPTO</option>
                                <option value="EM DESENVOLVIMENTO">EM DESENVOLVIMENTO</option>
                            </select>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                                <button className="btn-secondary-dash" style={{ flex: 2, justifyContent: 'center' }} onClick={() => setModalFilter(false)}>FILTRAR</button>
                                <button className="btn-secondary-dash" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setFilterAno(""); setFilterStatus(""); }}>LIMPAR</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Adicionar Aluno */}
            {modalAdd && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setModalAdd(false)}><i className="fas fa-times-circle"></i></button>
                        <h2 className="section-title-2">CADASTRAR ALUNO</h2>
                        <form className="filter-options">
                            <label>NOME COMPLETO:</label>
                            <input type="text" className="filter-input" required placeholder="Nome do aluno" />
                            <label style={{ marginTop: '15px', display: 'block' }}>ANO ESCOLAR:</label>
                            <select className="filter-input">
                                <option value="1º MÉDIO">1º MÉDIO</option>
                                <option value="2º MÉDIO">2º MÉDIO</option>
                                <option value="3º MÉDIO">3º MÉDIO</option>
                                <option value="9º FUNDAMENTAL">9º FUNDAMENTAL</option>
                            </select>
                            <div style={{ marginTop: '15px' }}><label>IDADE:</label><input type="number" className="filter-input" required min="14" max="20" /></div>
                            <button type="submit" className="btn-secondary-dash" style={{ marginTop: '30px', width: '100%', justifyContent: 'center' }}>FINALIZAR CADASTRO</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Importar */}
            {modalImport && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setModalImport(false)}><i className="fas fa-times-circle"></i></button>
                        <h2 className="section-title-2" style={{ textAlign: 'center', marginBottom: '30px' }}>IMPORTAR PLANILHA</h2>
                        <button className="btn-secondary-dash" style={{ width: '100%', marginBottom: '15px', justifyContent: 'center', height:'55px' }}><i className="fas fa-download"></i> BAIXAR MODELO</button>
                        <div className="file-drop-area" style={{ padding: '25px', border: '2px dashed #333', textAlign: 'center' }} onClick={() => document.getElementById('xlsxInput').click()}>
                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: '#555' }}></i>
                            <span style={{ display: 'block', color: '#888', fontSize: '0.8rem' }}>Clique ou arraste .xlsx</span>
                            <input type="file" id="xlsxInput" hidden accept=".xlsx" onChange={processarPlanilha} />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Preview Import */}
            {modalPreview && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ maxWidth: '600px', borderColor: '#217346' }}>
                        <button className="close-btn" onClick={() => setModalPreview(false)}><i className="fas fa-times-circle"></i></button>
                        <h2 className="section-title-2" style={{ textAlign: 'center', color: '#217346' }}>PRÉ-VISUALIZAÇÃO</h2>
                        <p style={{ textAlign: 'center', color: '#fff' }}>{alunosParaImportar.length} alunos encontrados</p>
                        <div style={{ maxHeight: '300px', overflowY: 'auto', background: '#080808', padding: '10px', marginTop: '15px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr style={{ borderBottom: '1px solid #333' }}><th style={{ textAlign: 'left', color: '#888' }}>NOME</th><th style={{ textAlign: 'left', color: '#888' }}>ANO</th></tr></thead>
                                <tbody>
                                    {alunosParaImportar.map((a, i) => (<tr key={i}><td style={{ color: '#fff', padding: '8px' }}>{a.nome}</td><td style={{ color: '#888' }}>{a.ano_escolar}</td></tr>))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button className="btn-secondary-dash" style={{ flex: 1, justifyContent: 'center', borderColor: '#217346' }} onClick={() => { setModalPreview(false); setModalLoading(true); }}>CONFIRMAR</button>
                            <button className="btn-secondary-dash" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setModalPreview(false)}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edit Aluno (4 TABS) */}
            {modalEdit && selectedAluno && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ maxWidth: '450px', padding: '30px' }}>
                        <button className="close-btn" onClick={() => setModalEdit(false)}><i className="fas fa-times-circle"></i></button>
                        <h2 className="section-title-2" style={{ fontSize: '1.1rem', marginBottom: '20px' }}><i className="fas fa-user-edit"></i> {selectedAluno.nome}</h2>
                        
                        <div className="edit-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '5px' }}>
                            <button className={`tab-btn ${editTab === 'info' ? 'active' : ''}`} onClick={() => setEditTab('info')}>ACESSO</button>
                            <button className={`tab-btn ${editTab === 'notas' ? 'active' : ''}`} onClick={() => setEditTab('notas')}>NOTAS</button>
                            <button className={`tab-btn ${editTab === 'add' ? 'active' : ''}`} onClick={() => setEditTab('add')}>LANÇAR</button>
                            <button className={`tab-btn ${editTab === 'presenca' ? 'active' : ''}`} onClick={() => setEditTab('presenca')}>FALTAS</button>
                        </div>

                        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                            {editTab === 'info' && (
                                <div className="tab-content active">
                                    <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px', borderLeft: '4px solid var(--primary-red)' }}>
                                        <p style={{ color: '#888', fontSize: '0.7rem', textTransform: 'uppercase' }}>Credenciais</p>
                                        <p style={{ color: '#fff' }}><i className="fas fa-envelope" style={{ color: 'var(--primary-red)', width: '20px' }}></i> {selectedAluno.email || 'Não cadastrado'}</p>
                                        <p style={{ color: '#fff' }}><i className="fas fa-lock" style={{ color: 'var(--primary-red)', width: '20px' }}></i> {selectedAluno.senha || '*******'}</p>
                                    </div>
                                </div>
                            )}
                            {editTab === 'notas' && (
                                <div className="tab-content active">
                                    <div className="competencias-list-edit" style={{maxHeight:'200px', overflowY:'auto'}}>
                                        {selectedAluno.competencias?.map((c, i) => (
                                            <div className="competencia-edit-item" key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px', background:'#111', marginBottom:'5px', borderRadius:'8px'}}>
                                                <span style={{color:'#fff'}}>{c.nome}</span>
                                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                                    <span style={{color:'var(--primary-red)', fontWeight:'bold'}}>{c.nota}</span>
                                                    <span className="material-symbols-outlined" style={{fontSize:'1.2rem', color:'#555', cursor:'pointer'}}>delete</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {editTab === 'add' && (
                                <div className="tab-content active">
                                    <form className="filter-options">
                                        <label>COMPETÊNCIA:</label>
                                        <select className="filter-input">
                                            <option value="">SELECIONE...</option>
                                            {listaCompetencias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                        </select>
                                        <div style={{marginTop:'10px'}}><label>NOTA:</label><input type="number" step="0.1" className="filter-input" /></div>
                                        <button className="btn-secondary-dash" style={{ marginTop: '15px', width: '100%', justifyContent: 'center' }}>REGISTRAR NOTA</button>
                                    </form>
                                </div>
                            )}
                            {editTab === 'presenca' && (
                                <div className="tab-content active">
                                    <form className="filter-options">
                                        <label>FREQUÊNCIA ATUAL (%)</label>
                                        <input type="number" className="filter-input" defaultValue={selectedAluno.presenca} />
                                        <button className="btn-secondary-dash" style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}>ATUALIZAR STATUS</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Erase All */}
            {modalEraseAll && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content modal-small">
                        <button className="close-btn" onClick={() => setModalEraseAll(false)}><i className="fas fa-times-circle"></i></button>
                        <div className="modal-icon-warning"><i className="fas fa-exclamation-triangle"></i></div>
                        <h2 className="modal-title-warning">APAGAR TUDO?</h2>
                        <p className="modal-text-warning">Essa ação removerá TODOS os alunos e notas. Não pode ser desfeita.</p>
                        <div className="modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button className="btn-secondary-dash" style={{ justifyContent: 'center', background: 'var(--primary-red)' }}><span className="material-symbols-outlined">delete</span> SIM, APAGAR TUDO</button>
                            <button className="btn-secondary-dash" style={{ justifyContent: 'center' }} onClick={() => setModalEraseAll(false)}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Loading */}
            {modalLoading && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ textAlign: 'center', borderColor: '#217346' }}>
                        <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '3rem', color: '#217346', marginBottom: '20px' }}></i>
                        <h3 style={{ color: '#fff' }}>IMPORTANDO DADOS</h3>
                        <div style={{ width: '100%', height: '6px', background: '#1a1a1a', borderRadius: '10px', overflow: 'hidden', marginTop: '15px' }}>
                            <div style={{ width: `${importProgress}%`, height: '100%', background: '#217346' }}></div>
                        </div>
                        <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '10px' }}>{loadingStatusText}</p>
                    </div>
                </div>
            )}

            {/* Modal Sucesso Export */}
            {modalExportSuccess && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ textAlign: 'center' }}>
                        <button className="close-btn" onClick={() => setModalExportSuccess(false)}><i className="fas fa-times-circle"></i></button>
                        <h2 style={{ color: '#fff' }}>Relatório Gerado</h2>
                        <p style={{ color: '#888', margin: '15px 0' }}>O download começou com sucesso.</p>
                        <button className="btn-secondary-dash" onClick={() => setModalExportSuccess(false)}>CONCLUIR</button>
                    </div>
                </div>
            )}
        </div>
    );
}