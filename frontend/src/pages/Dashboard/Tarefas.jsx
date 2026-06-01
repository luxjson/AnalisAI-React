import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarProfessor from '../../components/layout/SidebarProfessor';
import useExternalStyle from '../../hooks/useExternalStyle';

export default function DashboardTarefas({ 
    user = "Professor", 
    userCargo = "Professor", 
    tarefas = [], 
    alunos = [], 
    listaCompetencias = [],
    stats = { total: 0, ativas: 0, atrasadas: 0 },
    success_msg = "",
    error_msg = ""
}) {
    // Carrega os 4 arquivos de estilo conforme o EJS
    useExternalStyle('sidebar.css', 'dashboard.css', 'edit.css', 'tarefas.css');

    // --- ESTADOS DE INTERFACE ---
    const [filtros, setFiltros] = useState({ turma: '', status: '' });
    const [activeModal, setActiveModal] = useState(null); // 'nova', 'ver', 'avaliar', 'editar'
    const [activeTab, setActiveTab] = useState('geral'); // 'geral', 'config', 'alunos'
    const [editTab, setEditTab] = useState('geral'); // 'geral', 'config'

    // --- ESTADOS DE DADOS ---
    const [selectedTarefa, setSelectedTarefa] = useState(null);
    const [taskAlunosData, setTaskAlunosData] = useState([]); // Dados detalhados da tarefa (alunos/entregas)
    
    // Estados do Formulário "Nova Tarefa"
    const [novaTarefaForm, setNovaTarefaForm] = useState({
        titulo: '', descricao: '', turma: '', data_entrega: '', competencia_id: '', prioridade: 'MEDIA', alunosSelecionados: []
    });

    // --- LÓGICA DE FILTRAGEM DE TAREFAS NA TELA ---
    const tarefasFiltradas = tarefas.filter(t => {
        const matchTurma = filtros.turma === "" || t.turma === filtros.turma;
        const matchStatus = filtros.status === "" || t.status === filtros.status;
        return matchTurma && matchStatus;
    });

    // --- FUNÇÕES DOS MODAIS ---

    // Simulação do verTarefa (que no EJS fazia um fetch)
    const handleVerTarefa = (id) => {
        const tarefaFound = tarefas.find(t => t.id === id);
        setSelectedTarefa(tarefaFound);
        // Aqui você faria o fetch para pegar a lista de alunos vinculados
        // setTaskAlunosData(response.alunos);
        setActiveModal('ver');
    };

    const handleEditarTarefa = (id) => {
        const tarefaFound = tarefas.find(t => t.id === id);
        setSelectedTarefa(tarefaFound);
        setEditTab('geral');
        setActiveModal('editar');
    };

    const handleAvaliarTarefa = (id) => {
        const tarefaFound = tarefas.find(t => t.id === id);
        setSelectedTarefa(tarefaFound);
        // Simulação de carregamento de alunos que entregaram
        setActiveModal('avaliar');
    };

    // Lógica "Vincular a turma toda" do Modal Nova Tarefa
    const toggleTodosAlunos = (checked) => {
        if (checked) {
            const alunosDaTurma = alunos
                .filter(a => novaTarefaForm.turma === '' || a.ano_escolar === novaTarefaForm.turma)
                .map(a => a.id);
            setNovaTarefaForm({ ...novaTarefaForm, alunosSelecionados: alunosDaTurma });
        } else {
            setNovaTarefaForm({ ...novaTarefaForm, alunosSelecionados: [] });
        }
    };

    const handleCheckboxAluno = (alunoId) => {
        const selecionados = [...novaTarefaForm.alunosSelecionados];
        if (selecionados.includes(alunoId)) {
            setNovaTarefaForm({ ...novaTarefaForm, alunosSelecionados: selecionados.filter(id => id !== alunoId) });
        } else {
            setNovaTarefaForm({ ...novaTarefaForm, alunosSelecionados: [...selecionados, alunoId] });
        }
    };

    return (
        <div className="dash-body">
            <SidebarProfessor userCargo={userCargo} />

            <div className="main-layout">
                <header className="dash-header">
                    <div className="header-left"><h1>Gerenciar Tarefas</h1></div>
                    <div className="header-user">
                        <div className="user-profile-group">
                            <div className="user-details">
                                <span className="user-name"><strong>{user}</strong></span>
                                <br />
                                <span className="user-role" style={{ color: '#888888' }}><strong>{userCargo}</strong></span>
                            </div>
                        </div>
                        <div className="header-actions">
                            <div className="header-icon"><i className="fas fa-bell"></i></div>
                        </div>
                    </div>
                </header>

                {/* ALERTAS */}
                {success_msg && (
                    <div className="alert alert-success">
                        {success_msg}
                        <span className="close-alert" onClick={(e) => e.target.parentElement.style.display='none'}>&times;</span>
                    </div>
                )}
                {error_msg && (
                    <div className="alert alert-error">
                        {error_msg}
                        <span className="close-alert" onClick={(e) => e.target.parentElement.style.display='none'}>&times;</span>
                    </div>
                )}

                <div className="tarefas-header">
                    <button className="btn-secondary-dash" onClick={() => { setActiveModal('nova'); setActiveTab('geral'); }} style={{ padding: '12px 25px' }}>
                        <i className="fas fa-plus"></i> NOVA TAREFA
                    </button>
                </div>

                {/* CARDS DE ESTATÍSTICAS */}
                <div className="tarefas-stats">
                    <div className="stat-card">
                        <div className="stat-icon"><i className="fas fa-tasks"></i></div>
                        <div className="stat-info"><h3>{stats.total || 0}</h3><p>Total de Tarefas</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><i className="fas fa-clock"></i></div>
                        <div className="stat-info"><h3>{stats.ativas || 0}</h3><p>Tarefas Ativas</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><i className="fas fa-exclamation-triangle"></i></div>
                        <div className="stat-info"><h3>{stats.atrasadas || 0}</h3><p>Atrasadas</p></div>
                    </div>
                </div>

                {/* FILTROS */}
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="filtros-tarefas">
                        <div className="filtro-group">
                            <label>TURMA</label>
                            <select className="filtro-select" value={filtros.turma} onChange={(e) => setFiltros({ ...filtros, turma: e.target.value })}>
                                <option value="">TODAS AS TURMAS</option>
                                <option value="1º MÉDIO">1º MÉDIO</option>
                                <option value="2º MÉDIO">2º MÉDIO</option>
                                <option value="3º MÉDIO">3º MÉDIO</option>
                                <option value="9º FUNDAMENTAL">9º FUNDAMENTAL</option>
                            </select>
                        </div>
                        <div className="filtro-group">
                            <label>STATUS</label>
                            <select className="filtro-select" value={filtros.status} onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}>
                                <option value="">TODOS OS STATUS</option>
                                <option value="ATIVA">ATIVA</option>
                                <option value="CONCLUIDA">CONCLUÍDA</option>
                            </select>
                        </div>
                        <div className="filtro-group" style={{ flex: '0 0 auto' }}>
                            <button type="button" className="btn-secondary-dash" onClick={() => setFiltros({ turma: '', status: '' })}>
                                <i className="fas fa-times"></i> LIMPAR
                            </button>
                        </div>
                    </div>
                </form>

                {/* GRID DE TAREFAS */}
                {tarefasFiltradas.length > 0 ? (
                    <div className="tarefas-grid">
                        {tarefasFiltradas.map(tarefa => {
                            const totalAlunos = parseInt(tarefa.total_alunos) || 0;
                            const concluidas = parseInt(tarefa.concluidas) || 0;
                            const percentual = totalAlunos > 0 ? Math.round((concluidas / totalAlunos) * 100) : 0;
                            const isUrgente = new Date(tarefa.data_entrega) < new Date() && tarefa.status === 'ATIVA';

                            return (
                                <div className="tarefa-card" key={tarefa.id}>
                                    <div className={`tarefa-prioridade ${tarefa.prioridade.toLowerCase()}`}>{tarefa.prioridade}</div>
                                    <div className="tarefa-header">
                                        <h3 className="tarefa-titulo">{tarefa.titulo}</h3>
                                        <span className="tarefa-turma"><i className="fas fa-users"></i> {tarefa.turma}</span>
                                    </div>
                                    <p className="tarefa-descricao">{tarefa.descricao || 'Sem descrição'}</p>
                                    <div className="tarefa-meta">
                                        <div className={`tarefa-data ${isUrgente ? 'urgente' : ''}`}>
                                            <i className="far fa-calendar-alt"></i> {new Date(tarefa.data_entrega).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div className="tarefa-data"><i className="fas fa-user"></i> {tarefa.professor_nome || 'Professor'}</div>
                                    </div>
                                    <div className="tarefa-progresso">
                                        <div className="progresso-header"><span>Progresso</span><span>{concluidas}/{totalAlunos}</span></div>
                                        <div className="progresso-bar"><div className="progresso-fill" style={{ width: `${percentual}%` }}></div></div>
                                    </div>
                                    <div className="tarefa-footer">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <i className="fas fa-clock" style={{ color: '#d4a017' }}></i>
                                            <span style={{ color: '#d4a017', fontSize: '0.8rem' }}>{tarefa.status}</span>
                                        </div>
                                        <span style={{ color: '#666', fontSize: '0.75rem' }}>{concluidas}/{totalAlunos}</span>
                                    </div>
                                    <div className="tarefa-acoes">
                                        <button className="btn-tarefa" onClick={() => handleVerTarefa(tarefa.id)} title="Ver detalhes"><i className="fas fa-eye"></i></button>
                                        <button className="btn-tarefa" onClick={() => handleEditarTarefa(tarefa.id)} title="Editar"><i className="fa-solid fa-pen"></i></button>
                                        <button className="btn-tarefa excluir" title="Excluir"><span className="material-symbols-outlined">delete</span></button>
                                        {(parseInt(tarefa.entregues) > 0) && (
                                            <button className="btn-tarefa" onClick={() => handleAvaliarTarefa(tarefa.id)} title="Avaliar" style={{ borderColor: '#217346', color: '#217346' }}>
                                                <i className="fas fa-star"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-tarefas">
                        <i className="fas fa-tasks"></i>
                        <h3>Nenhuma tarefa encontrada</h3>
                        <p>Clique em "NOVA TAREFA" para começar.</p>
                    </div>
                )}

                <footer className="dash-footer">
                    <Link to="/dashboard/edit" className="btn-secondary-dash"><i className="fas fa-pencil-alt"></i> EDITOR DE NOTAS</Link>
                    <div className="footer-credits"><p>© 2026 AnalisAI</p></div>
                </footer>
            </div>

            {/* --- MODAL: NOVA TAREFA --- */}
            {activeModal === 'nova' && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ maxWidth: '500px', padding: '30px' }}>
                        <button className="close-btn" onClick={() => setActiveModal(null)}><i className="fas fa-times-circle"></i></button>
                        <h2 className="section-title-2" style={{ fontSize: '1.1rem', marginBottom: '20px' }}>NOVA TAREFA</h2>
                        
                        <div className="edit-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', borderBottom: 'none' }}>
                            <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>GERAL</button>
                            <button className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>AJUSTES</button>
                            <button className={`tab-btn ${activeTab === 'alunos' ? 'active' : ''}`} onClick={() => setActiveTab('alunos')}>ALUNOS</button>
                        </div>

                        <form style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                            {activeTab === 'geral' && (
                                <div className="tab-content active">
                                    <div className="filter-options">
                                        <label>TÍTULO DA ATIVIDADE</label>
                                        <input type="text" className="filter-input" required />
                                        <label style={{ marginTop: '15px' }}>DESCRIÇÃO DETALHADA</label>
                                        <textarea className="filter-input" rows="5" style={{ resize: 'none' }}></textarea>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'config' && (
                                <div className="tab-content active">
                                    <div className="filter-options">
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div>
                                                <label>TURMA</label>
                                                <select className="filter-input" value={novaTarefaForm.turma} onChange={(e) => setNovaTarefaForm({ ...novaTarefaForm, turma: e.target.value })}>
                                                    <option value="">SELECIONE</option>
                                                    <option value="1º MÉDIO">1º MÉDIO</option>
                                                    <option value="2º MÉDIO">2º MÉDIO</option>
                                                    <option value="3º MÉDIO">3º MÉDIO</option>
                                                    <option value="9º FUNDAMENTAL">9º FUNDAMENTAL</option>
                                                </select>
                                            </div>
                                            <div><label>DATA LIMITE</label><input type="date" className="filter-input" /></div>
                                        </div>
                                        <label style={{ marginTop: '15px' }}>COMPETÊNCIA ALVO</label>
                                        <select className="filter-input">
                                            <option value="">NENHUMA ESPECÍFICA</option>
                                            {listaCompetencias.map(comp => <option key={comp.id} value={comp.id}>{comp.nome}</option>)}
                                        </select>
                                        <label style={{ marginTop: '15px' }}>NÍVEL DE PRIORIDADE</label>
                                        <select className="filter-input">
                                            <option value="BAIXA">BAIXA</option>
                                            <option value="MEDIA">MÉDIA</option>
                                            <option value="ALTA">ALTA</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'alunos' && (
                                <div className="tab-content active">
                                    <div className="filter-options">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: '#1a1a1a', padding: '12px', borderRadius: '10px' }}>
                                            <input type="checkbox" onChange={(e) => toggleTodosAlunos(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                                            <span style={{ color: '#fff', fontSize: '0.75rem' }}>VINCULAR A TURMA TODA</span>
                                        </label>
                                        <div className="alunos-tarefa" style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '15px', background: '#080808', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '10px' }}>
                                            {alunos
                                                .filter(a => novaTarefaForm.turma === '' || a.ano_escolar === novaTarefaForm.turma)
                                                .map(aluno => (
                                                    <div className="aluno-tarefa-item" key={aluno.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={novaTarefaForm.alunosSelecionados.includes(aluno.id)}
                                                            onChange={() => handleCheckboxAluno(aluno.id)}
                                                            style={{ width: '15px', height: '15px' }} 
                                                        />
                                                        <div className="aluno-tarefa-info">
                                                            <h4 style={{ fontSize: '0.8rem', color: '#fff' }}>{aluno.nome}</h4>
                                                            <p style={{ fontSize: '0.65rem', color: '#888' }}>{aluno.ano_escolar}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <button type="submit" className="btn-secondary-dash" style={{ marginTop: '25px', width: '100%', height: '50px', justifyContent: 'center' }}>
                                <i className="fas fa-save"></i> PUBLICAR ATIVIDADE
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: VER DETALHES --- */}
            {activeModal === 'ver' && selectedTarefa && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content modal-lg">
                        <button className="close-btn" onClick={() => setActiveModal(null)}><i className="fas fa-times-circle"></i></button>
                        <h2 className="section-title-2">DETALHES DA TAREFA</h2>
                        <div className="filter-options">
                            <h3 style={{ color: '#fff', textAlign: 'center', borderBottom: '1px solid #333', paddingBottom: '10px' }}>{selectedTarefa.titulo}</h3>
                            <p style={{ color: '#888', background: '#111', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>{selectedTarefa.descricao || 'Sem descrição'}</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '20px' }}>
                                <div className="info-display-item"><label>TURMA</label><div className="value">{selectedTarefa.turma}</div></div>
                                <div className="info-display-item"><label>PRIORIDADE</label><div className="value">{selectedTarefa.prioridade}</div></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: AVALIAR (FEEDBACK/NOTA) --- */}
            {activeModal === 'avaliar' && selectedTarefa && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content modal-lg">
                        <button className="close-btn" onClick={() => setActiveModal(null)}><i className="fas fa-times-circle"></i></button>
                        <h2 className="section-title-2">AVALIAR TAREFA</h2>
                        <div className="filter-options">
                            <h3 style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>{selectedTarefa.titulo}</h3>
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {/* Aqui repetiria a lógica do EJS para cada aluno (Entregue/Feedback) */}
                                <p style={{ color: '#666', textAlign: 'center' }}>Carregando entregas dos alunos...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: EDITAR --- */}
            {activeModal === 'editar' && selectedTarefa && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ maxWidth: '500px', padding: '30px' }}>
                        <button className="close-btn" onClick={() => setActiveModal(null)}><i className="fas fa-times-circle"></i></button>
                        <h2 className="section-title-2">EDITAR TAREFA</h2>
                        <div className="edit-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                            <button className={`tab-btn ${editTaskTab === 'geral' ? 'active' : ''}`} onClick={() => setEditTaskTab('geral')}>CONTEÚDO</button>
                            <button className={`tab-btn ${editTaskTab === 'config' ? 'active' : ''}`} onClick={() => setEditTaskTab('config')}>CONFIGURAÇÕES</button>
                        </div>
                        <form style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                            {editTaskTab === 'geral' && (
                                <div className="filter-options">
                                    <label>TÍTULO</label>
                                    <input type="text" className="filter-input" defaultValue={selectedTarefa.titulo} />
                                    <label style={{ marginTop: '15px' }}>DESCRIÇÃO</label>
                                    <textarea className="filter-input" rows="6" defaultValue={selectedTarefa.descricao}></textarea>
                                </div>
                            )}
                            {editTaskTab === 'config' && (
                                <div className="filter-options">
                                    <label>DATA LIMITE</label>
                                    <input type="date" className="filter-input" defaultValue={selectedTarefa.data_entrega?.split('T')[0]} />
                                    <label style={{ marginTop: '15px' }}>STATUS</label>
                                    <select className="filter-input" defaultValue={selectedTarefa.status}>
                                        <option value="ATIVA">ATIVA</option>
                                        <option value="CONCLUIDA">CONCLUÍDA</option>
                                    </select>
                                </div>
                            )}
                            <button type="submit" className="btn-secondary-dash" style={{ marginTop: '25px', width: '100%', justifyContent: 'center' }}>
                                <i className="fas fa-save"></i> ATUALIZAR TAREFA
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}