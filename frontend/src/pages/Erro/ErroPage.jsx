import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useExternalStyle from '../../hooks/useExternalStyle';
import SidebarProfessor from '../../components/layout/SidebarProfessor';
import SidebarAluno from '../../components/layout/SidebarAluno';

export default function ErroPage({ 
    user = "Usuário", 
    userCargo = "Professor", 
    isAdmin = false, 
    titulo, 
    mensagem, 
    erroDetalhe 
}) {
    // Carrega os 3 arquivos de CSS usando o seu hook atualizado
    useExternalStyle('sidebar.css', 'dashboard.css', 'edit.css');
    
    const navigate = useNavigate();
    const [isEraseModalOpen, setIsEraseModalOpen] = useState(false);

    // Funções do Modal (Equivalentes ao <script> do EJS)
    const openEraseModal = () => setIsEraseModalOpen(true);
    const closeEraseModal = () => setIsEraseModalOpen(false);

    return (
        <div className="dash-body">
            

            {userCargo === 'Professor' || userCargo === 'Admin' ? (
                <SidebarProfessor userCargo={userCargo} />
            ) : (
                <SidebarAluno />
            )}

            <div className="main-layout">
                <header className="dash-header">
                    <div className="header-left">
                        <h1>
                            {titulo || 'OPS! ALGO DEU ERRADO'}
                        </h1>
                    </div>
                    
                    <div className="header-user">
                        <div className="user-profile-group">
                            <div className="user-details">
                                <span className="user-name"><strong>{user}</strong></span>
                                <br />
                                <span className="user-role" style={{ color: '#888888' }}>
                                    <strong>{userCargo}</strong>
                                </span>
                            </div>
                        </div>
                        <div className="header-actions">
                            {/* Componente de notificações seria inserido aqui */}
                            <div className="header-icon">
                                <i className="fas fa-bell"></i>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="dash-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'center' }}>
                        <div className="modal-icon-warning" style={{ fontSize: '4rem', color: 'var(--primary-red)', marginBottom: '20px' }}>
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        
                        <h2 className="modal-title-warning" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
                            {titulo || 'OPS! ALGO DEU ERRADO'}
                        </h2>
                        
                        <p className="modal-text-warning" style={{ color: '#888', fontSize: '1rem', lineHeight: '1.6', marginBottom: '30px' }}>
                            {mensagem || 'Ocorreu um erro inesperado. Tente novamente.'}
                        </p>
                        
                        {erroDetalhe && (
                            <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '10px', marginBottom: '30px', textAlign: 'left', border: '2px solid #333' }}>
                                <p style={{ color: '#ff0101', fontSize: '0.85rem', marginBottom: '5px' }}>Detalhes:</p>
                                <p style={{ color: '#888', fontSize: '0.8rem', fontFamily: 'monospace' }}>{erroDetalhe}</p>
                            </div>
                        )}
                        
                        <div className="modal-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {/* Botão Voltar */}
                            <button 
                                onClick={() => navigate(-1)} 
                                className="btn-secondary-dash" 
                                style={{ textDecoration: 'none', height: '55px', cursor: 'pointer', background: 'transparent' }}
                            >
                                <i className="fas fa-arrow-left"></i> VOLTAR
                            </button>
                            
                            {/* Botão Admin para Limpar Base */}
                            {isAdmin && (
                                <button 
                                    onClick={openEraseModal} 
                                    className="btn-secondary-dash" 
                                    style={{ textDecoration: 'none', height: '55px', cursor: 'pointer', background: 'transparent' }}
                                >
                                    <i className="fas fa-database"></i> LIMPAR BASE DE DADOS (ALUNOS)
                                </button>
                            )}
                        </div>
                    </div>
                </main>

                <footer className="dash-footer">
                    <div className="footer-credits" style={{ width: '100%', textAlign: 'center' }}>
                        <p>© 2026 AnalisAI</p>
                    </div>
                </footer>
            </div>

            {/* Modal de confirmação do Admin (Erase All) */}
            {isAdmin && isEraseModalOpen && (
                <div id="eraseAllModal" className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content modal-small">
                        
                        <button className="close-btn" onClick={closeEraseModal}>
                            <i className="fas fa-times-circle"></i>
                        </button>
                        
                        <div className="modal-icon-warning">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        
                        <h2 className="modal-title-warning">APAGAR TUDO?</h2>
                        
                        <p className="modal-text-warning">
                            Esta ação irá remover <strong>TODOS</strong> os alunos, notas e competências atribuídas.<br />
                            As competências padrão do sistema serão mantidas.<br />
                            <span style={{ color: '#ff0101' }}>Esta operação não pode ser desfeita.</span>
                        </p>
                        
                        <div className="modal-actions">
                            <form action="/dashboard/erase-all" method="POST">
                                <button type="submit" className="btn-secondary-dash" style={{ justifyContent: 'center', height: '50px', width: '300px' }}>
                                    <span className="material-symbols-outlined">delete</span> SIM, APAGAR TUDO
                                </button>
                            </form>
                            <button 
                                onClick={closeEraseModal} 
                                className="btn-secondary-dash" 
                                style={{ marginLeft: '9px', justifyContent: 'center', height: '50px', width: '300px' }}
                            >
                                CANCELAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}