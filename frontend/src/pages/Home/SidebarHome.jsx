import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useExternalStyle from '../../hooks/useExternalStyle';

export default function SidebarHome() {
  useExternalStyle('sidebar.css');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  // Efeito para monitorar o scroll e marcar o link ativo
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = "inicio";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        // Se o scroll passou do topo da seção (com um respiro de 200px)
        if (window.pageYOffset >= sectionTop - 200) {
          current = section.getAttribute('id');
        }
      });

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Funções do Modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo-container">
            <a href="#inicio">
              <img src="/IMG/sideBarLogo.png" alt="S" className="sideBarLogo" />
            </a>
          </div>

          <div className="divider"></div>

          {/* Link: Início */}
          <a href="#inicio" className={`side-link ${activeSection === 'inicio' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fas fa-home"></i></div>
            <span className="link-text">Início</span>
            <div className="active-indicator"></div>
          </a>

          {/* Link: Pilares (Sobre) */}
          <a href="#sobre" className={`side-link ${activeSection === 'sobre' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fas fa-layer-group"></i></div>
            <span className="link-text">Pilares</span>
            <div className="active-indicator"></div>
          </a>

          {/* Link: Dúvidas (FAQ) */}
          <a href="#faq" className={`side-link ${activeSection === 'faq' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fas fa-question-circle"></i></div>
            <span className="link-text">Dúvidas</span>
            <div className="active-indicator"></div>
          </a>
        </div>

        <div className="sidebar-bottom">
          {/* Botão Sobre - Abre Modal */}
          <button 
            className="side-link" 
            onClick={openModal}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
          >
            <div className="icon-box"><i className="fas fa-info-circle"></i></div>
            <span className="link-text">Sobre</span>
          </button>

          {/* Link para Login */}
          <Link to="/login" className="side-link exit-link">
            <div className="icon-box"><i className="fas fa-sign-in-alt"></i></div>
            <span className="link-text">Entrar</span>
          </Link>
        </div>
      </aside>

      {/* MODAL DE INFORMAÇÕES */}
      {isModalOpen && (
        <div className="modal-new-overlay" style={{ display: 'flex' }} onClick={(e) => e.target.className === 'modal-new-overlay' && closeModal()}>
          <div className="modal-new-card">
            <button className="modal-new-close" onClick={closeModal}>
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
              <Link to="/equipe" className="modal-link">Time de desenvolvimento</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}