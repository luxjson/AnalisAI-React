import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useExternalStyle from '../../hooks/useExternalStyle';
import SidebarProfessor from '../../components/layout/SidebarProfessor';

export default function Dashboard({ 
    user = "Professor", 
    userCargo = "Professor", 
    alunos = [], 
    rankingGeral = [], 
    rankingMedio = [], 
    rankingFundamental = [] 
}) {
    // Carrega os estilos originais
    useExternalStyle('sidebar.css', 'dashboard.css');

    // Estados
    const [rankingTab, setRankingTab] = useState('geral');
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    // Lógica de contagem (idêntica ao processamento do EJS)
    const countAlunos = (tipo, nivel) => {
        return alunos.filter(a => a.ano_escolar?.includes(tipo) && a.nivel === nivel).length;
    };

    const totalAlunos = (tipo) => {
        return alunos.filter(a => a.ano_escolar?.includes(tipo)).length;
    };

    return (
        <div className="dash-body">
            {/* Sidebar do Professor */}
            <SidebarProfessor userCargo={userCargo} />

            <div className="main-layout">
                <header className="dash-header">
                    <div className="header-left">
                        <button 
                            className="header-info-btn" 
                            onClick={() => setIsInfoModalOpen(true)} 
                            title="Sobre o sistema"
                            style={{cursor: 'pointer' }}
                        >
                            <i className="fas fa-info-circle"></i>
                        </button>
                    </div>
                    
                    <div className="header-user">
                        <div className="user-profile-group">
                            <div className="user-details">
                                <span className="user-name"><strong>{user}</strong></span>
                                <br />
                                <span className="user-role" style={{ color: '#888888' }}><strong>{userCargo}</strong></span>
                            </div>
                        </div>
                        <div className="header-actions">
                            <div className="header-icon">
                                <i className="fas fa-bell"></i>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="dash-content">
                    {/* Banner de Boas-vindas */}
                    <section className="welcome-banner">
                        <div className="banner-text">
                            <h1>Bem-vindo(a) de volta, {user.split(' ')[0].toUpperCase()}!</h1>
                            <p>Acompanhe o desempenho das turmas e gerencie as competências de forma simples.</p>
                        </div>
                    </section>

                    {/* Seção Ensino Médio */}
                    <section className="section-container">
                        <h2 className="section-title-2"><i className="fas fa-graduation-cap"></i> ENSINO MÉDIO</h2>
                        <div className="dash-grid">
                            <div className="stats-card">
                                <h3>TOTAL DE ALUNOS</h3>
                                <p className="stats-number">{totalAlunos('MÉDIO')}</p>
                            </div>
                            <div className="stats-card apto">
                                <h3>APTOS</h3>
                                <p className="stats-number">{countAlunos('MÉDIO', 'APTO')}</p>
                            </div>
                            <div className="stats-card inapto">
                                <h3>INAPTOS</h3>
                                <p className="stats-number">{countAlunos('MÉDIO', 'INAPTO')}</p>
                            </div>
                            <div className="stats-card desenvolvimento">
                                <h3>EM DESENVOLVIMENTO</h3>
                                <p className="stats-number">{countAlunos('MÉDIO', 'EM DESENVOLVIMENTO')}</p>
                            </div>
                        </div>
                    </section>

                    {/* Seção Ensino Fundamental */}
                    <section className="section-container">
                        <h2 className="section-title-2"><i className="fas fa-book"></i> ENSINO FUNDAMENTAL</h2>
                        <div className="dash-grid">
                            <div className="stats-card">
                                <h3>TOTAL DE ALUNOS</h3>
                                <p className="stats-number">{totalAlunos('FUNDAMENTAL')}</p>
                            </div>
                            <div className="stats-card apto">
                                <h3>APTOS</h3>
                                <p className="stats-number">{countAlunos('FUNDAMENTAL', 'APTO')}</p>
                            </div>
                            <div className="stats-card inapto">
                                <h3>INAPTOS</h3>
                                <p className="stats-number">{countAlunos('FUNDAMENTAL', 'INAPTO')}</p>
                            </div>
                            <div className="stats-card desenvolvimento">
                                <h3>EM DESENVOLVIMENTO</h3>
                                <p className="stats-number">{countAlunos('FUNDAMENTAL', 'EM DESENVOLVIMENTO')}</p>
                            </div>
                        </div>
                    </section>

                    {/* Seção Ranking de Competências */}
                    <section className="section-container ranking-section">
                        <h2 className="section-title-2"><i className="fas fa-trophy"></i> RANKING DE COMPETÊNCIAS</h2>
                        
                        <div className="ranking-tabs">
                            <button className={`ranking-tab ${rankingTab === 'geral' ? 'active' : ''}`} onClick={() => setRankingTab('geral')}>GERAL</button>
                            <button className={`ranking-tab ${rankingTab === 'medio' ? 'active' : ''}`} onClick={() => setRankingTab('medio')}>ENSINO MÉDIO</button>
                            <button className={`ranking-tab ${rankingTab === 'fundamental' ? 'active' : ''}`} onClick={() => setRankingTab('fundamental')}>ENSINO FUNDAMENTAL</button>
                        </div>

                        {/* Conteúdo dinâmico das abas */}
                        <div className="ranking-contents">
                            {rankingTab === 'geral' && (
                                <div id="rankingGeral" className="ranking-content active">
                                    {rankingGeral.length > 0 ? (
                                        <div className="ranking-list">
                                            {rankingGeral.map((comp, index) => <RankingItem key={index} comp={comp} index={index} />)}
                                        </div>
                                    ) : <EmptyRanking />}
                                </div>
                            )}

                            {rankingTab === 'medio' && (
                                <div id="rankingMedio" className="ranking-content active">
                                    {rankingMedio.length > 0 ? (
                                        <div className="ranking-list">
                                            {rankingMedio.map((comp, index) => <RankingItem key={index} comp={comp} index={index} />)}
                                        </div>
                                    ) : <EmptyRanking msg="Ensino Médio" />}
                                </div>
                            )}

                            {rankingTab === 'fundamental' && (
                                <div id="rankingFundamental" className="ranking-content active">
                                    {rankingFundamental.length > 0 ? (
                                        <div className="ranking-list">
                                            {rankingFundamental.map((comp, index) => <RankingItem key={index} comp={comp} index={index} />)}
                                        </div>
                                    ) : <EmptyRanking msg="Ensino Fundamental" />}
                                </div>
                            )}
                        </div>
                    </section>
                </main>

                <footer className="dash-footer">
                    <div className="footer-actions">
                        <Link to="/dashboard/edit" className="btn-secondary-dash"><i className="fas fa-pencil-alt"></i> GERENCIAR</Link>
                        <Link to="/dashboard/relatorios" className="btn-secondary-dash"><i className="fas fa-chart-pie"></i> ESTATÍSTICAS</Link>
                        <Link to="/manuais/professor" className="btn-secondary-dash"><i className="fas fa-book-open"></i> MANUAL DO PROFESSOR</Link>
                    </div>
                    <div className="footer-credits">
                        <p>© 2026 AnalisAI</p>
                    </div>
                </footer>
            </div>

            {/* MODAL SOBRE O SISTEMA COMPLETO */}
            {isInfoModalOpen && (
                <div id="infoModal" className="modal-new-overlay" style={{ display: 'flex' }} onClick={(e) => e.target.id === 'infoModal' && setIsInfoModalOpen(false)}>
                    <div className="modal-new-card">
                        <button className="modal-new-close" onClick={() => setIsInfoModalOpen(false)}>
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
                                <div className="info-item">
                                    <span>Ambiente</span>
                                    <p>Produção</p>
                                </div>
                                <div className="info-item">
                                    <span>Atualização</span>
                                    <p>Junho 2026</p>
                                </div>
                            </div>
                        </div>

                        <div className="modal-new-footer">
                            <p>© 2026 AnalisAI</p>
                            <Link to="/dashboard/equipe" className="modal-link">Time de desenvolvimento</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Subcomponentes
function RankingItem({ comp, index }) {
    const medalClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
    const notaClass = comp.media >= 7 ? 'apto' : comp.media >= 5 ? 'desenvolvimento' : 'inapto';

    return (
        <div className="ranking-item">
            <div className={`ranking-position ${medalClass}`}>{index + 1}º</div>
            <div className="ranking-info">
                <h4>{comp.nome}</h4>
                <p>{comp.total_avaliacoes} avaliações</p>
            </div>
            <div className="ranking-media">
                <span className={`media-nota ${notaClass}`}>{Number(comp.media).toFixed(1)}</span>
            </div>
        </div>
    );
}

function EmptyRanking({ msg = "" }) {
    return (
        <div className="empty-ranking">
            <i className="fas fa-chart-bar"></i>
            <p>Nenhuma competência avaliada ainda {msg}</p>
        </div>
    );
}