import React from 'react';
import { Link } from 'react-router-dom';
import SidebarHome from './SidebarHome'; // Importando a Sidebar que criamos
import useExternalStyle from '../../hooks/useExternalStyle';

export default function Home() {
    useExternalStyle('home.css', 'dashboard.css');
  return (
    <div className="dash-body home-page-container">
      {/* Inclui a Sidebar (que contém o modal e navegação #) */}
      <SidebarHome />

      <div className="main-layout">
        <div className="home-content-wrapper">
          
          {/* Header Superior da Landing Page */}
          <header className="dash-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '40px' }}>
            <div className="header-left">
              <img src="/IMG/logo3-white.png" alt="AnalisAI" style={{ height: '35px' }} />
            </div>
            <div className="header-user">
              <div className="header-actions">
                <Link to="/login" className="btn-secondary-dash" style={{ color: '#fff', textDecoration: 'none' }}>
                  ACESSAR PAINEL
                </Link>
              </div>
            </div>
          </header>

          <main>
            {/* Seção Início */}
            <section id="inicio" className="welcome-banner" style={{ padding: '100px 60px', borderRadius: '30px', marginBottom: '80px', position: 'relative' }}>
              <div className="banner-text">
                <h1 style={{ fontSize: '4rem', lineHeight: 1, marginBottom: '20px' }}>
                  SISTEMA DE <br /> ANÁLISE DE AVANÇOS
                </h1>
                <p style={{ fontSize: '1.2rem', maxWidth: '600px', opacity: 0.9 }}>
                  Organize competências, monitore frequências e alcance objetivos educacionais com a precisão de dados em tempo real.
                </p>
              </div>
            </section>

            {/* Seção Sobre / Pilares */}
            <section id="sobre" style={{ marginBottom: '100px' }}>
              <h2 className="section-title-2" style={{ marginBottom: '40px' }}>PILARES ESTRATÉGICOS</h2>
              <div className="dash-grid">
                <div className="card-elite">
                  <div className="card-line"></div>
                  <i className="fas fa-university icon-accent"></i>
                  <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>SENAI CIC</h3>
                  <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.6 }}>Referência em formação profissional, o SENAI CIC atua como hub tecnológico preparando talentos para a Indústria 4.0.</p>
                </div>

                <div className="card-elite">
                  <div className="card-line"></div>
                  <i className="fas fa-chart-line icon-accent"></i>
                  <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>ANÁLISE DE DADOS</h3>
                  <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.6 }}>Transformamos avaliações complexas em indicadores visuais claros para identificar a aptidão de cada estudante.</p>
                </div>

                <div className="card-elite">
                  <div className="card-line"></div>
                  <i className="fas fa-bullseye icon-accent"></i>
                  <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>RESULTADOS</h3>
                  <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.6 }}>Acompanhe a evolução das turmas e garanta o sucesso acadêmico com decisões baseadas em dados organizados.</p>
                </div>
              </div>
            </section>

            {/* Seção FAQ / Dúvidas */}
            <section id="faq" style={{ marginBottom: '120px', maxWidth: '800px' }}>
              <h2 className="section-title-2" style={{ marginBottom: '40px' }}>DÚVIDAS FREQUENTES</h2>
              <div className="faq-container">
                <details>
                  <summary>Como o nível do aluno é calculado?</summary>
                  <p style={{ color: '#666', paddingTop: '15px', fontSize: '0.9rem' }}>O sistema cruza a nota (mínima 7.0) com a presença (mínima 75%) para definir o status.</p>
                </details>
                <details>
                  <summary>O sistema é exclusivo para o SENAI?</summary>
                  <p style={{ color: '#666', paddingTop: '15px', fontSize: '0.9rem' }}>Sim, é uma ferramenta personalizada para otimização de fluxos internos do SENAI CIC.</p>
                </details>
              </div>
            </section>
          </main>

          <footer className="dash-footer">
            <div className="footer-credits">
              <p>© 2026 AnalisAI</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}