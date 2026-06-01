import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarProfessor from '../../components/layout/SidebarProfessor';
import useExternalStyle from '../../hooks/useExternalStyle';

export default function DashboardCalendario({ 
    user = "Professor", 
    userCargo = "Professor", 
    eventosIniciais = [], 
    feriadosIniciais = [], 
    tipos = [], // Categorias da legenda
    filtrosIniciais = { mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), turma: '' },
    success_msg = "",
    error_msg = ""
}) {
    // Carrega os 4 arquivos de estilo necessários
    useExternalStyle('sidebar.css', 'dashboard.css', 'edit.css', 'calendario.css');

    // --- ESTADOS ---
    const [filtros, setFiltros] = useState(filtrosIniciais);
    const [eventos, setEventos] = useState(eventosIniciais);
    const [feriados, setFeriados] = useState(feriadosIniciais);
    const [modalEvento, setModalEvento] = useState(false);
    const [modalFeriado, setModalFeriado] = useState(false);
    const [eventTab, setEventTab] = useState('info'); // info ou data

    // --- LÓGICA DO CALENDÁRIO ---
    
    // Obter dias do mês e preenchimento inicial (offset da semana)
    const renderCalendario = () => {
        const primeiroDia = new Date(filtros.ano, filtros.mes - 1, 1);
        const ultimoDia = new Date(filtros.ano, filtros.mes, 0);
        const diasNoMes = ultimoDia.getDate();
        const inicioSemana = primeiroDia.getDay(); // 0 (DOM) a 6 (SÁB)

        const cells = [];
        
        // Células vazias do mês anterior
        for (let i = 0; i < inicioSemana; i++) {
            cells.push(<div key={`empty-${i}`} className="dia-cell outro-mes"></div>);
        }

        // Dias do mês atual
        for (let dia = 1; dia <= diasNoMes; dia++) {
            const dataStr = `${filtros.ano}-${String(filtros.mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            
            // Filtrar eventos do dia (levando em conta a turma)
            const eventosDia = eventos.filter(e => {
                const inicio = new Date(e.data_inicio + 'T00:00:00');
                const fim = e.data_fim ? new Date(e.data_fim + 'T23:59:59') : new Date(e.data_inicio + 'T23:59:59');
                const dataAtual = new Date(dataStr + 'T12:00:00');
                const matchTurma = filtros.turma === "" || e.turma === filtros.turma || !e.turma;
                return dataAtual >= inicio && dataAtual <= fim && matchTurma;
            });

            // Filtrar feriados do dia
            const feriadosDia = feriados.filter(f => {
                const dataFeriado = new Date(f.data + 'T12:00:00');
                return dataFeriado.getDate() === dia && (dataFeriado.getMonth() + 1) === filtros.mes;
            });

            cells.push(
                <div className="dia-cell" key={dataStr} data-data={dataStr}>
                    <div className="dia-numero">{dia}</div>
                    <div className="dia-eventos">
                        {feriadosDia.map((f, i) => (
                            <div key={`feriado-${i}`} className="evento-item evento-feriado" title={f.nome}>
                                <i className="fas fa-star"></i> {f.nome}
                            </div>
                        ))}
                        {eventosDia.map((e, i) => (
                            <div key={`evento-${i}`} className="evento-item" style={{ background: e.cor }} title={e.titulo}>
                                {e.titulo}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return cells;
    };

    // Navegação de mês
    const mudarMes = (direcao) => {
        let novoMes = filtros.mes + direcao;
        let novoAno = filtros.ano;

        if (novoMes > 12) {
            novoMes = 1;
            novoAno++;
        } else if (novoMes < 1) {
            novoMes = 12;
            novoAno--;
        }
        setFiltros({ ...filtros, mes: novoMes, ano: novoAno });
    };

    // Lista consolidada de próximos eventos (Lateral)
    const proximosEventos = [
        ...eventos.map(e => ({ ...e, tipo: 'evento' })),
        ...feriados.map(f => ({
            id: `feriado-${f.id}`,
            titulo: f.nome,
            data_inicio: f.data,
            cor: '#ff0101',
            tipo: 'feriado',
            feriado_id: f.id
        }))
    ].sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio)).slice(0, 10);

    return (
        <div className="dash-body">
            <SidebarProfessor userCargo={userCargo} />

            <div className="main-layout">
                <header className="dash-header">
                    <div className="header-left"><h1>Calendário Escolar</h1></div>
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

                {success_msg && <div className="alert alert-success">{success_msg}<span className="close-alert">&times;</span></div>}
                {error_msg && <div className="alert alert-error">{error_msg}<span className="close-alert">&times;</span></div>}

                <div className="calendario-container">
                    <div className="calendario-main">
                        <div className="calendario-header">
                            <div className="calendario-mes">
                                <button className="btn-mes" onClick={() => mudarMes(-1)}><i className="fas fa-chevron-left"></i></button>
                                <h2 id="mesAtual">
                                    {new Date(filtros.ano, filtros.mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                                </h2>
                                <button className="btn-mes" onClick={() => mudarMes(1)}><i className="fas fa-chevron-right"></i></button>
                            </div>
                        </div>

                        <div className="calendario-grid">
                            <div className="dia-semana">DOM</div><div className="dia-semana">SEG</div>
                            <div className="dia-semana">TER</div><div className="dia-semana">QUA</div>
                            <div className="dia-semana">QUI</div><div className="dia-semana">SEX</div>
                            <div className="dia-semana">SÁB</div>
                            {renderCalendario()}
                        </div>
                    </div>

                    <div className="calendario-sidebar">
                        <h3 style={{ color: '#fff', marginBottom: '20px' }}>FILTROS</h3>
                        <div className="filtros-calendario">
                            <div className="filtro-group">
                                <label>TURMA</label>
                                <select 
                                    className="filtro-select" 
                                    value={filtros.turma} 
                                    onChange={(e) => setFiltros({ ...filtros, turma: e.target.value })}
                                >
                                    <option value="">TODAS AS TURMAS</option>
                                    <option value="1º MÉDIO">1º MÉDIO</option>
                                    <option value="2º MÉDIO">2º MÉDIO</option>
                                    <option value="3º MÉDIO">3º MÉDIO</option>
                                    <option value="9º FUNDAMENTAL">9º FUNDAMENTAL</option>
                                </select>
                            </div>
                        </div>

                        <h3 style={{ color: '#fff', margin: '20px 0' }}>LEGENDA</h3>
                        <div className="legenda-item">
                            <div className="legenda-cor" style={{ background: '#ff0101' }}></div>
                            <span className="legenda-texto">Feriados</span>
                        </div>
                        {tipos.map((t, i) => (
                            <div className="legenda-item" key={i}>
                                <div className="legenda-cor" style={{ background: t.cor }}></div>
                                <span className="legenda-texto">{t.tipo}</span>
                                <span className="legenda-count">{t.total}</span>
                            </div>
                        ))}

                        <button className="btn-secondary-dash" style={{ marginTop: '20px', width: '100%', height: '55px', justifyContent: 'center' }} onClick={() => setModalEvento(true)}>
                            <i className="fas fa-plus"></i> NOVO EVENTO
                        </button>
                        <button className="btn-secondary-dash" style={{ marginTop: '10px', width: '100%', height: '55px', justifyContent: 'center' }} onClick={() => setModalFeriado(true)}>
                            <i className="fas fa-star"></i> NOVO FERIADO
                        </button>

                        <h3 style={{ color: '#fff', margin: '20px 0' }}>PRÓXIMOS EVENTOS</h3>
                        <div className="eventos-lista">
                            {proximosEventos.map((e, i) => (
                                <div className="evento-lista-item" key={i}>
                                    <div className="evento-lista-cor" style={{ background: e.cor }}></div>
                                    <div className="evento-lista-info">
                                        <div className="evento-lista-titulo">
                                            {e.titulo} {e.tipo === 'feriado' && <span style={{ color: '#ff0101', fontSize: '0.7rem' }}>(FERIADO)</span>}
                                        </div>
                                        <div className="evento-lista-data">{new Date(e.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                                    </div>
                                    {userCargo === 'Admin' && (
                                        <button className="evento-lista-remover"><i className="fas fa-times"></i></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODAL: NOVO EVENTO --- */}
            {modalEvento && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ maxWidth: '450px', padding: '30px' }}>
                        <button className="close-btn" onClick={() => setModalEvento(false)}><i className="fas fa-times-circle"></i></button>
                        <h2 className="section-title-2" style={{ fontSize: '1.1rem', marginBottom: '20px' }}>NOVO EVENTO</h2>
                        
                        <div className="edit-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', borderBottom: 'none' }}>
                            <button className={`tab-btn ${eventTab === 'info' ? 'active' : ''}`} onClick={() => setEventTab('info')}>INFORMAÇÕES</button>
                            <button className={`tab-btn ${eventTab === 'data' ? 'active' : ''}`} onClick={() => setEventTab('data')}>AGENDAMENTO</button>
                        </div>

                        <form style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                            {eventTab === 'info' ? (
                                <div className="filter-options">
                                    <label>TÍTULO</label>
                                    <input type="text" className="filter-input" required />
                                    <label style={{ marginTop: '15px' }}>DESCRIÇÃO</label>
                                    <textarea className="filter-input" rows="5" style={{ resize: 'none' }}></textarea>
                                </div>
                            ) : (
                                <div className="filter-options">
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                                        <div><label>CATEGORIA</label><select className="filter-input"><option value="evento">Evento</option><option value="prova">Prova</option></select></div>
                                        <div><label>COR</label><input type="color" className="filter-input" style={{ height: '42px', padding: '5px' }} defaultValue="#ff0101" /></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                                        <div><label>INÍCIO</label><input type="date" className="filter-input" required /></div>
                                        <div><label>TÉRMINO</label><input type="date" className="filter-input" /></div>
                                    </div>
                                    <label style={{ marginTop: '15px' }}>TURMA ALVO</label>
                                    <select className="filter-input"><option value="">GERAL / TODAS</option><option value="1º MÉDIO">1º MÉDIO</option></select>
                                </div>
                            )}
                            <button type="submit" className="btn-secondary-dash" style={{ marginTop: '25px', width: '100%', height: '50px', justifyContent: 'center' }}>SALVAR EVENTO</button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: NOVO FERIADO --- */}
            {modalFeriado && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ maxWidth: '400px', padding: '30px' }}>
                        <button className="close-btn" onClick={() => setModalFeriado(false)}><i className="fas fa-times-circle"></i></button>
                        <h2 className="section-title-2" style={{ fontSize: '1.1rem', marginBottom: '20px' }}>NOVO FERIADO</h2>
                        <form style={{ marginTop: '5px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                            <div className="filter-options">
                                <label>IDENTIFICAÇÃO</label>
                                <input type="text" className="filter-input" placeholder="Nome do feriado" required />
                                <label style={{ marginTop: '15px' }}>DATA</label>
                                <input type="date" className="filter-input" required />
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1a1a1a', padding: '12px', borderRadius: '12px', marginTop: '20px', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                                    <span style={{ color: '#fff', fontSize: '0.75rem' }}>REPETIR TODOS OS ANOS</span>
                                </label>
                            </div>
                            <button type="submit" className="btn-secondary-dash" style={{ marginTop: '25px', width: '100%', height: '50px', justifyContent: 'center' }}>REGISTRAR FERIADO</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}