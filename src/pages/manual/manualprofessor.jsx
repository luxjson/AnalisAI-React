import React from 'react';
import { Link } from 'react-router-dom';
import useDynamicCSS from '../../hooks/useDynamicCSS';
import Sidebar from '../../components/professor/sidebar';

const ManualProfessor = () => {
  // Carrega os CSS dinamicamente
  useDynamicCSS(['/CSS/sidebar.css', '/CSS/dashboard.css', '/CSS/extra.css']);

  return (
    <body className="dash-body">
      <Sidebar />
      <div className="main-layout">
        <header className="dash-header">
          <div className="logo">
            <img src="/IMG/logo3-white.png" alt="AnalisAI" />
          </div>
          <h2 className="page-title">MANUAL DO USUÁRIO</h2>
        </header>
        
        <div className="pdf-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <span className="pdf-title" style={{
            fontSize: '1.2rem',
            color: 'var(--primary-red, #ff0101)',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            DOCUMENTO ORIENTADOR
          </span>
          <a 
            href="/PDF/manual-de-uso.pdf" 
            download 
            className="btn-secondary-dash"
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid var(--primary-red, #ff0101)',
              color: 'var(--primary-red, #ff0101)',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: '0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ff0101';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#ff0101';
            }}
          >
            <i className="fas fa-download"></i> BAIXAR PDF
          </a>
        </div>
        
        <div className="pdf-container" style={{
          width: '100%',
          height: 'calc(100vh - 150px)',
          marginTop: '20px',
          border: '1px solid #1a1a1a',
          borderRadius: '12px',
          background: '#0c0c0c'
        }}>
          <iframe 
            src="/PDF/manual-de-uso.pdf" 
            title="Manual do Usuário"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '12px'
            }}
          />
        </div>
      </div>
    </body>
  );
};

export default ManualProfessor;