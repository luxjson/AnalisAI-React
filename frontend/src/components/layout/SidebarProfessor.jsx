import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function SidebarProfessor({ userCargo = 'Admin' }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation();

    // Função para verificar se a rota é a ativa
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-top">
                    <div className="logo-container">
                        <img src="/IMG/sideBarLogo.png" alt="S" className="sideBarLogo" />
                    </div>
                    
                    <div className="divider"></div>

                    <Link to="/dashboard" className={`side-link ${isActive('/dashboard')}`}>
                        <div className="icon-box"><i className="fas fa-home"></i></div>
                        <span className="link-text">Início</span>
                        <div className="active-indicator"></div>
                    </Link>

                    <Link to="/dashboard/edit" className={`side-link ${isActive('/dashboard/edit')}`}>
                        <div className="icon-box"><i className="fas fa-pen"></i></div>
                        <span className="link-text">Editor</span>
                        <div className="active-indicator"></div>
                    </Link>

                    <Link to="/dashboard/tarefas" className={`side-link ${isActive('/dashboard/tarefas')}`}>
                        <div className="icon-box"><i className="fas fa-tasks"></i></div>
                        <span className="link-text">Tarefas</span>
                        <div className="active-indicator"></div>
                    </Link>

                    <Link to="/dashboard/relatorios" className={`side-link ${isActive('/dashboard/relatorios')}`}>
                        <div className="icon-box"><i className="fas fa-chart-bar"></i></div>
                        <span className="link-text">Relatórios</span>
                        <div className="active-indicator"></div>
                    </Link>

                    <Link to="/dashboard/calendario" className={`side-link ${isActive('/dashboard/calendario')}`}>
                        <div className="icon-box"><i className="fas fa-calendar"></i></div>
                        <span className="link-text">Calendário</span>
                        <div className="active-indicator"></div>
                    </Link>

                    {userCargo === 'Admin' && (
                        <Link to="/dashboard/usuarios" className={`side-link ${isActive('/dashboard/usuarios')}`}>
                            <div className="icon-box"><i className="fas fa-users"></i></div>
                            <span className="link-text">Usuários</span>
                            <div className="active-indicator"></div>
                        </Link>
                    )}
                </div>
                
                <div className="sidebar-bottom">
                    <Link to="/dashboard/config" className={`side-link ${isActive('/dashboard/config')}`}>
                        <div className="icon-box"><i className="fas fa-cog"></i></div>
                        <span className="link-text">Ajustes</span>
                        <div className="active-indicator"></div>
                    </Link>
                    
                    <Link to="/login" className="side-link exit-link">
                        <div className="icon-box"><i className="fas fa-sign-out-alt"></i></div>
                        <span className="link-text">Sair</span>
                    </Link>
                </div>
            </aside>

            {/* Modal Sobre */}
            {isModalOpen && (
                <div id="infoModal" className="modal-new-overlay" style={{ display: 'flex' }} onClick={(e) => e.target.id === 'infoModal' && setIsModalOpen(false)}>
                    <div className="modal-new-card">
                        <button className="modal-new-close" onClick={() => setIsModalOpen(false)}>
                            <i className="fas fa-times"></i>
                        </button>
                        <div className="modal-new-header" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                            <img src="/IMG/logo3-white.png" alt="AnalisAI" className="modal-new-logo" />
                            <div className="version-badge">Versão 1.0.4</div>
                        </div>
                        <div className="modal-new-body">
                            <p className="modal-new-text">
                                Plataforma avançada para gestão de competências e análise de desempenho educacional. 
                                Desenvolvida para facilitar a visualização de dados e tomada de decisão pedagógica.
                            </p>
                            <div className="modal-new-divider"></div>
                            <div className="modal-new-info-grid">
                                <div className="info-item"><span>Ambiente</span><p>Produção</p></div>
                                <div className="info-item"><span>Atualização</span><p>Junho 2026</p></div>
                            </div>
                        </div>
                        <div className="modal-new-footer">
                            <p>© 2026 AnalisAI</p>
                            <Link to="/dashboard/equipe" className="modal-link">Time de desenvolvimento</Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Restrição Mobile */}
            <div className="mobile-restriction-overlay">
                <div className="restriction-card">
                    <div className="restriction-line"></div>
                    <img src="/IMG/logo3-white.png" alt="AnalisAI" className="restriction-logo" />
                    <div className="restriction-icon-box">
                        <i className="fas fa-desktop pc-icon"></i>
                        <div className="restriction-divider"><i className="fas fa-times"></i></div>
                        <i className="fas fa-mobile-alt mobile-icon"></i>
                    </div>
                    <h2>Plataforma Restrita</h2>
                    <p>O <strong>AnalisAI</strong> é um ecossistema de alta performance. O acesso é exclusivo para <span>Desktop ou notebooks</span>.</p>
                </div>
            </div>
        </>
    );
}