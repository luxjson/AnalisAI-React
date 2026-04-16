import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // Links da sidebar (parte superior)
  const topLinks = [
    { path: '/professor/portal', icon: 'fas fa-home', title: 'Inicio' },
    { path: '/professor/notas', icon: 'fas fa-pen', title: 'Editor de notas' },
    { path: '/professor/tarefas', icon: 'fas fa-tasks', title: 'Gestão de tarefas' },
    { path: '/professor/graficos', icon: 'fas fa-chart-bar', title: 'Relatórios analíticos' },
    { path: '/professor/calendario', icon: 'fas fa-calendar-alt', title: 'Calendário escolar' },
  ];

  // Mostrar link de usuários apenas para Admin
  if (user?.cargo === 'Admin') {
    topLinks.push({ path: '/admin', icon: 'fas fa-users', title: 'Gestão de usuários' });
  }

  // Links da parte inferior
  const bottomLinks = [
    { path: '/professor/config', icon: 'fas fa-cog', title: 'Configurações' },
    { path: '/dashboard/equipe', icon: 'fas fa-code', title: 'Equipe de desenvolvedores' },
  ];

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-top">
          {topLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`side-link ${currentPath === link.path ? 'active' : ''}`}
              title={link.title}
            >
              <i className={link.icon}></i>
            </Link>
          ))}
        </div>
        
        <div className="sidebar-bottom">
          {bottomLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`side-link ${currentPath === link.path ? 'active' : ''}`}
              title={link.title}
            >
              <i className={link.icon}></i>
            </Link>
          ))}
          <button 
            onClick={openModal}
            className="side-link"
            title="Sobre o site"
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
          >
            <i className="fas fa-info-circle"></i>
          </button>
        </div>
      </aside>

      {/* Modal Sobre */}
      {modalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }} onClick={closeModal}>
          <div className="modal-content" style={{
            backgroundColor: '#0c0c0c',
            borderRadius: '20px',
            padding: '30px',
            width: '90%',
            maxWidth: '400px',
            textAlign: 'center',
            border: '1px solid #1a1a1a',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={closeModal}
              className="close-btn"
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: '#ff0101',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-times-circle"></i>
            </button>
            <div className="modal-body">
              <img 
                src="/IMG/logo3-white.png" 
                alt="AnalisAI" 
                className="modal-logo"
                style={{ width: '150px', marginBottom: '20px' }}
              />
              <h3 className="version-text" style={{ color: '#ff0101', marginBottom: '10px' }}>
                VERSÃO 1.0
              </h3>
              <p className="copyright-text" style={{ color: '#666', fontSize: '0.8rem' }}>
                © SENAI - Serviço Nacional de Aprendizagem Industrial
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;