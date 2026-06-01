import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarProfessor from '../../components/layout/SidebarProfessor';
import useExternalStyle from '../../hooks/useExternalStyle';

export default function DashboardUsuarios({ 
    user = "Usuário", 
    userCargo = "Professor", 
    userId = "", // ID do usuário logado para evitar que ele se delete
    usuarios = [], 
    isAdmin = false,
    success_msg = "",
    error_msg = ""
}) {
    // Carrega os estilos conforme o EJS original
    useExternalStyle('sidebar.css', 'dashboard.css', 'edit.css', 'usuarios.css');

    // --- ESTADOS ---
    const [searchTerm, setSearchTerm] = useState('');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' ou 'update'
    
    // Estado do formulário do modal
    const [formData, setFormData] = useState({
        id: '',
        nome: '',
        email: '',
        senha: '',
        cargo: 'Professor',
        status: 'ATIVO'
    });

    // --- FUNÇÕES DE CONTROLE ---
    const openAddUserModal = () => {
        if (isAdmin) {
            setModalMode('add');
            setFormData({ id: '', nome: '', email: '', senha: '', cargo: 'Professor', status: 'ATIVO' });
            setIsUserModalOpen(true);
        } else {
            setIsPermissionModalOpen(true);
        }
    };

    const handleEditUser = (u) => {
        if (isAdmin) {
            setModalMode('update');
            setFormData({
                id: u.id,
                nome: u.nome,
                email: u.email.toLowerCase(),
                cargo: u.cargo,
                status: u.status,
                senha: '' // Senha fica vazia no edit por segurança
            });
            setIsUserModalOpen(true);
        } else {
            setIsPermissionModalOpen(true);
        }
    };

    const confirmDeleteUser = (id, nome) => {
        if (isAdmin) {
            if (window.confirm(`Deseja realmente remover o acesso de ${nome}?`)) {
                console.log("Deletando usuário:", id);
                // No React você chamaria uma função de deletar via API aqui
            }
        } else {
            setIsPermissionModalOpen(true);
        }
    };

    // Filtragem da tabela em tempo real
    const filteredUsuarios = usuarios.filter(u => 
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dash-body">
            <SidebarProfessor userCargo={userCargo} />

            <div className="main-layout">
                <header className="dash-header">
                    <div className="header-left"><h1>Gestão de Usuários</h1></div>
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

                <div className="toolbar">
                    <div className="action-buttons">
                        <button className="btn-secondary-dash" onClick={openAddUserModal} title="Novo Usuário">
                            <i className="fas fa-user-plus"></i> NOVO USUÁRIO
                        </button>
                    </div>

                    <div className="search-container">
                        <i className="fas fa-search"></i>
                        <input 
                            type="text" 
                            placeholder="Pesquisar por nome ou e-mail..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <main className="edit-content">
                    <div className="table-container">
                        <table className="alunos-table">
                            <thead>
                                <tr>
                                    <th>ID</th><th>NOME</th><th>E-MAIL</th><th>CARGO</th><th>STATUS</th><th>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsuarios.length > 0 ? (
                                    filteredUsuarios.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.id}</td>
                                            <td>{u.nome}</td>
                                            <td>{u.email.toLowerCase()}</td>
                                            <td>{u.cargo}</td>
                                            <td>
                                                <span className={`status ${u.status === 'ATIVO' ? 'apto' : 'inapto'}`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="td-actions">
                                                <button className="btn-table-add" onClick={() => handleEditUser(u)} title="Editar">
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                {u.id !== userId && (
                                                    <button 
                                                        className="delete-link" 
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                                        onClick={() => confirmDeleteUser(u.id, u.nome)}
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" style={{ padding: '50px', textAlign: 'center' }}>Nenhum usuário encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>

                <footer className="dash-footer">
                    <Link to="/dashboard/edit" className="btn-secondary-dash">
                        <i className="fas fa-pencil-alt"></i> EDITOR DE NOTAS
                    </Link>
                    <div className="footer-credits"><p>© 2026 AnalisAI</p></div>
                </footer>
            </div>

            {/* --- MODAL USUÁRIO (NOVO/EDITAR) --- */}
            {isUserModalOpen && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setIsUserModalOpen(false)}><i className="fas fa-times-circle"></i></button>
                        <h2 className="section-title-2">{modalMode === 'add' ? 'NOVO USUÁRIO' : 'EDITAR USUÁRIO'}</h2>
                        
                        <form className="filter-options">
                            <label>NOME COMPLETO:</label>
                            <input 
                                type="text" 
                                className="filter-input" 
                                value={formData.nome}
                                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                required 
                            />

                            <label style={{ marginTop: '15px', display: 'block' }}>E-MAIL:</label>
                            <input 
                                type="email" 
                                className="filter-input" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required 
                            />

                            {modalMode === 'add' && (
                                <div id="passwordField">
                                    <label style={{ marginTop: '15px', display: 'block' }}>SENHA:</label>
                                    <input 
                                        type="password" 
                                        className="filter-input"
                                        value={formData.senha}
                                        onChange={(e) => setFormData({...formData, senha: e.target.value})}
                                    />
                                </div>
                            )}

                            <label style={{ marginTop: '15px', display: 'block' }}>CARGO:</label>
                            <select 
                                className="filter-input" 
                                value={formData.cargo}
                                onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                            >
                                <option value="Professor">Professor</option>
                                <option value="Coordenador">Coordenador</option>
                                <option value="Admin">Admin</option>
                            </select>

                            {modalMode === 'update' && (
                                <div id="statusField">
                                    <label style={{ marginTop: '15px', display: 'block' }}>STATUS:</label>
                                    <select 
                                        className="filter-input" 
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="ATIVO">ATIVO</option>
                                        <option value="INATIVO">INATIVO</option>
                                    </select>
                                </div>
                            )}

                            <button type="submit" className="btn-secondary-dash" style={{ marginTop: '30px', width: '100%', justifyContent: 'center' }}>
                                SALVAR USUÁRIO
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL ACESSO NEGADO --- */}
            {isPermissionModalOpen && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ maxWidth: '400px', borderColor: '#ff0101' }}>
                        <button className="close-btn" onClick={() => setIsPermissionModalOpen(false)}><i className="fas fa-times-circle"></i></button>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', color: '#ff0101', marginBottom: '15px' }}><i className="fas fa-shield-alt"></i></div>
                            <h2 className="section-title-2" style={{ color: '#ff0101', marginBottom: '15px' }}>ACESSO NEGADO</h2>
                            <p style={{ color: '#888', marginBottom: '20px' }}>Apenas administradores podem gerenciar usuários.</p>
                            <button className="btn-secondary-dash" onClick={() => setIsPermissionModalOpen(false)} style={{ width: '100%', justifyContent: 'center', color: '#ff0101', borderColor: '#ff0101' }}>ENTENDI</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}