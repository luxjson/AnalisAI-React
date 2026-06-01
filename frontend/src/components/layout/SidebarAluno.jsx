import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function SidebarAluno() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-top">
                    <div className="logo-container">
                        <img src="/IMG/sideBarLogo.png" alt="S" className="sideBarLogo" />
                    </div>
                    
                    <div className="divider"></div>

                    <Link to="/aluno" className={`side-link ${isActive('/aluno')}`}>
                        <div className="icon-box"><i className="fas fa-home"></i></div>
                        <span className="link-text">Início</span>
                        <div className="active-indicator"></div>
                    </Link>

                    <Link to="/aluno/competencias" className={`side-link ${isActive('/aluno/competencias')}`}>
                        <div className="icon-box"><i className="fa-solid fa-medal"></i></div>
                        <span className="link-text">Competências</span>
                        <div className="active-indicator"></div>
                    </Link>

                    <Link to="/aluno/tarefas" className={`side-link ${isActive('/aluno/tarefas')}`}>
                        <div className="icon-box"><i className="fa-solid fa-tasks"></i></div>
                        <span className="link-text">Tarefas</span>
                        <div className="active-indicator"></div>
                    </Link>

                    <Link to="/aluno/evolucao" className={`side-link ${isActive('/aluno/evolucao')}`}>
                        <div className="icon-box"><i className="fas fa-chart-line"></i></div>
                        <span className="link-text">Evolução</span>
                        <div className="active-indicator"></div>
                    </Link>
                </div>
                
                <div className="sidebar-bottom">
                    <Link to="/aluno/config" className={`side-link ${isActive('/aluno/config')}`}>
                        <div className="icon-box"><i className="fas fa-cog"></i></div>
                        <span className="link-text">Ajustes</span>
                        <div className="active-indicator"></div>
                    </Link>

                    <button 
                        className="side-link" 
                        onClick={() => setIsModalOpen(true)}
                        style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
                    >
                        <div className="icon-box"><i className="fas fa-info-circle"></i></div>
                        <span className="link-text">Sobre</span>
                        <div className="active-indicator"></div>
                    </button>
                    
                    <Link to="/login" className="side-link exit-link">
                        <div className="icon-box"><i className="fas fa-sign-out-alt"></i></div>
                        <span className="link-text">Sair</span>
                    </Link>
                </div>
            </aside>

            {/* Modal Sobre Aluno */}
            {isModalOpen && (
                <div id="infoModal" className="modal-new-overlay" style={{ display: 'flex' }} onClick={(e) => e.target.id === 'infoModal' && setIsModalOpen(false)}>
                    <div className="modal-new-card">
                        <button className="modal-new-close" onClick={() => setIsModalOpen(false)}>
                            <i className="fas fa-times"></i>
                        </button>
                        <div className="modal-new-header" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                            <img src="/IMG/logo3-green.png" alt="AnalisAI" className="modal-new-logo" />
                            <div className="version-badge" style={{ background: 'rgba(33, 115, 70, 0.1)', color: '#217346' }}>Versão Aluno 1.0.4</div>
                        </div>
                        <div className="modal-new-body">
                            <p className="modal-new-text">
                                Área exclusiva para estudantes. Acompanhe seu desempenho, visualize suas competências 
                                e monitore sua evolução acadêmica em tempo real.
                            </p>
                            <div className="modal-new-divider"></div>
                            <div className="modal-new-info-grid">
                                <div className="info-item"><span>Portal</span><p>Estudante</p></div>
                                <div className="info-item"><span>Status</span><p>Sincronizado</p></div>
                            </div>
                        </div>
                        <div className="modal-new-footer">
                            <p>© 2026 AnalisAI • Senai CIC</p>
                            <Link to="/aluno/equipe" className="modal-link">Time de desenvolvimento</Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Restrição Mobile */}
            <div className="mobile-restriction-overlay">
                {/* Mesma estrutura do professor... */}
            </div>
        </>
    );
}