import React, { useState } from 'react';
import SidebarProfessor from '../../components/layout/SidebarProfessor';
import useExternalStyle from '../../hooks/useExternalStyle';

export default function DashboardConfig({ 
    user = "Professor", 
    userCargo = "Professor", 
    email = "email@institucional.com",
    stats = { tarefas: 0, alunos: 0 },
    ultimoAcesso = "01/01/2026",
    configIniciais = {
        notificacoes_ativas: true,
        notificacoes_tarefas: true,
        notificacoes_avaliacoes: true,
        notificacoes_competencias: true
    },
    abaAtivaInicial = 'dados',
    success_msg = "",
    error_msg = ""
}) {
    useExternalStyle('sidebar.css', 'dashboard.css', 'config2.css');

    // --- ESTADOS ---
    const [abaAtiva, setAbaAtiva] = useState(abaAtivaInicial);
    const [notificacoes, setNotificacoes] = useState(configIniciais);
    const [showLocalSuccess, setShowLocalSuccess] = useState(false);

    // --- FUNÇÕES ---
    const toggleConfig = (chave) => {
        setNotificacoes({ ...notificacoes, [chave]: !notificacoes[chave] });
    };

    const handleSaveConfig = () => {
        console.log("Salvando configurações:", notificacoes);
        setShowLocalSuccess(true);
        setTimeout(() => setShowLocalSuccess(false), 3000);
    };

    return (
        <div className="dash-body">
            <SidebarProfessor userCargo={userCargo} />
            
            <div className="main-layout">
                <header className="dash-header">
                    <div className="header-left"><h1>Configurações</h1></div>
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
                
                <main className="dash-content">
                    <div className="perfil-grid">
                        <aside className="perfil-sidebar-card">
                            <div className="avatar-circle">{user.charAt(0).toUpperCase()}</div>
                            
                            <div className="perfil-info-base">
                                <h2 style={{ color: 'white' }}>{user}</h2>
                                <p style={{ color: 'var(--text-gray)' }}>{userCargo}</p>
                            </div>

                            <div className="perfil-stats-row">
                                <div className="stat-item"><span>Tarefas</span><strong>{stats.tarefas}</strong></div>
                                <div className="stat-item"><span>Alunos</span><strong>{stats.alunos}</strong></div>
                            </div>

                            <div style={{ textAlign: 'left', padding: '0 10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '10px' }}>
                                    <span style={{ color: 'var(--text-gray)' }}>Status:</span>
                                    <span className="media-nota apto" style={{ background: 'rgba(33,115,70,0.1)', color: '#217346', fontSize: '0.6rem', padding: '2px 10px', borderRadius: '5px' }}>ATIVO</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-gray)' }}>Último Acesso:</span>
                                    <span style={{ color: 'white' }}>{ultimoAcesso}</span>
                                </div>
                            </div>
                        </aside>
                        
                        <div className="perfil-main">
                            {(showLocalSuccess || success_msg) && (
                                <div id="mensagemSucesso" className="mensagem-sucesso" style={{ display: 'flex' }}>
                                    <i className="fas fa-check-circle"></i> Preferências salvas com sucesso!
                                </div>
                            )}

                            {error_msg && <div className="alert alert-error">{error_msg}</div>}

                            <nav className="tabs-container">
                                <button className={`tab-trigger ${abaAtiva === 'dados' ? 'active' : ''}`} onClick={() => setAbaAtiva('dados')}>Meus Dados</button>
                                <button className={`tab-trigger ${abaAtiva === 'notificacoes' ? 'active' : ''}`} onClick={() => setAbaAtiva('notificacoes')}>Notificações</button>
                                <button className={`tab-trigger ${abaAtiva === 'senha' ? 'active' : ''}`} onClick={() => setAbaAtiva('senha')}>Segurança</button>
                            </nav>
                            
                            {/* ABA DADOS */}
                            <div className={`tab-content ${abaAtiva === 'dados' ? 'active' : ''}`}>
                                <div className="info-grid">
                                    <div className="info-display-item"><label>Nome Completo</label><div className="value"><i className="fas fa-user"></i> {user}</div></div>
                                    <div className="info-display-item"><label>E-mail Institucional</label><div className="value"><i className="fas fa-envelope"></i> {email}</div></div>
                                    <div className="info-display-item"><label>Cargo / Função</label><div className="value"><i className="fas fa-briefcase"></i> {userCargo}</div></div>
                                </div>
                            </div>
                            
                            {/* ABA NOTIFICAÇÕES */}
                            <div className={`tab-content ${abaAtiva === 'notificacoes' ? 'active' : ''}`}>
                                <div className="toggle-item">
                                    <div><h4 style={{ color: 'white' }}>Alertas de Sistema</h4><p style={{ color: '#666' }}>Notificações globais da plataforma</p></div>
                                    <div className={`toggle-switch ${notificacoes.notificacoes_ativas ? 'ativo' : ''}`} onClick={() => toggleConfig('notificacoes_ativas')}></div>
                                </div>
                                
                                <div className="toggle-item">
                                    <div><h4 style={{ color: 'white' }}>Atividades de Alunos</h4><p style={{ color: '#666' }}>Avisar sobre novas entregas e tarefas</p></div>
                                    <div className={`toggle-switch ${notificacoes.notificacoes_tarefas ? 'ativo' : ''}`} onClick={() => toggleConfig('notificacoes_tarefas')}></div>
                                </div>

                                <button className="btn-secondary-dash" onClick={handleSaveConfig}>
                                    <i className="fas fa-save"></i> SALVAR CONFIGURAÇÕES
                                </button>
                            </div>
                            
                            {/* ABA SENHA */}
                            <div className={`tab-content ${abaAtiva === 'senha' ? 'active' : ''}`}>
                                <form className="senha-form" style={{ maxWidth: '500px' }} onSubmit={(e) => e.preventDefault()}>
                                    <label style={{ color: '#666', fontSize: '0.7rem' }}>SENHA ATUAL</label>
                                    <input type="password" className="form-input-premium" required />
                                    
                                    <label style={{ color: '#666', fontSize: '0.7rem', marginTop: '20px', display: 'block' }}>NOVA SENHA</label>
                                    <input type="password" className="form-input-premium" required minLength="6" placeholder="Mínimo 6 caracteres" />
                                    
                                    <label style={{ color: '#666', fontSize: '0.7rem', marginTop: '20px', display: 'block' }}>CONFIRMAR NOVA SENHA</label>
                                    <input type="password" className="form-input-premium" required />
                                    
                                    <button type="submit" className="btn-secondary-dash" style={{ marginTop: '30px' }}>
                                        <i className="fas fa-key"></i> ATUALIZAR SENHA
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}