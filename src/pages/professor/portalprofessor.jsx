import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import useDynamicCSS from '../../hooks/useDynamicCSS';
import Sidebar from '../../components/professor/Sidebar';

const PortalProfessor = () => {
  const [alunos, setAlunos] = useState([]);
  const [rankingGeral, setRankingGeral] = useState([]);
  const [rankingMedio, setRankingMedio] = useState([]);
  const [rankingFundamental, setRankingFundamental] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRanking, setActiveRanking] = useState('geral');
  const [user, setUser] = useState(null);

  useDynamicCSS(['/CSS/sidebar.css', '/CSS/dashboard.css']);

  useEffect(() => {
    carregarDashboard();
    carregarUser();
  }, []);

  const carregarUser = async () => {
    try {
      const response = await api.get('/me');
      if (response.data.type === 'professor') {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Erro ao carregar user');
    }
  };

  const carregarDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setAlunos(response.data.alunos);
      
      // Simulando rankings por tipo (seu backend precisa retornar separado)
      const allRanking = response.data.ranking || [];
      setRankingGeral(allRanking);
      
      // Filtra por tipo se tiver campo 'tipo' no retorno
      const medio = allRanking.filter(r => r.tipo === 'MÉDIO') || [];
      const fundamental = allRanking.filter(r => r.tipo === 'FUNDAMENTAL') || [];
      
      setRankingMedio(medio);
      setRankingFundamental(fundamental);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtrarAlunosPorNivel = (ano, nivel) => {
    return alunos.filter(a => a.ano_escolar?.includes(ano) && a.nivel === nivel).length;
  };

  const contarAlunosPorAno = (ano) => {
    return alunos.filter(a => a.ano_escolar?.includes(ano)).length;
  };

  const getMediaClass = (media) => {
    if (media >= 7) return 'apto';
    if (media >= 5) return 'desenvolvimento';
    return 'inapto';
  };

  const getPositionClass = (index) => {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return 'bronze';
    return '';
  };

  const showRanking = (tipo) => {
    setActiveRanking(tipo);
  };

  if (loading) {
    return (
      <div className="dash-body">
        <Sidebar />
        <div className="main-layout">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#ff0101' }}></i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-body">
      <Sidebar />

      <div className="main-layout">
        <header className="dash-header">
          <div className="logo">
            <img src="/IMG/logo3-white.png" alt="AnalisAI" />
          </div>
          <div className="header-user">
            <span>Bem-vindo, <strong>{user?.nome || 'Professor'}</strong></span>
            <Link to="/logout" className="logout-icon" title="Sair">
              <i className="fas fa-sign-out-alt"></i>
            </Link>
          </div>
        </header>

        <main className="dash-content">
          {/* ENSINO MÉDIO */}
          <section className="section-container">
            <h2 className="section-title-2"><i className="fas fa-graduation-cap"></i> ENSINO MÉDIO</h2>
            <div className="dash-grid">
              <div className="stats-card">
                <div className="stats-info">
                  <h3>TOTAL ALUNOS</h3>
                  <p className="stats-number">{contarAlunosPorAno('MÉDIO')}</p>
                </div>
                <i className="fas fa-users icon-bg"></i>
              </div>
              
              <div className="stats-card apto">
                <div className="stats-info">
                  <h3>APTOS</h3>
                  <p className="stats-number">{filtrarAlunosPorNivel('MÉDIO', 'APTO')}</p>
                </div>
                <i className="fas fa-check-circle icon-bg"></i>
              </div>

              <div className="stats-card inapto">
                <div className="stats-info">
                  <h3>INAPTOS</h3>
                  <p className="stats-number">{filtrarAlunosPorNivel('MÉDIO', 'INAPTO')}</p>
                </div>
                <i className="fas fa-times-circle icon-bg"></i>
              </div>

              <div className="stats-card desenvolvimento">
                <div className="stats-info">
                  <h3>EM DESENVOLVIMENTO</h3>
                  <p className="stats-number">{filtrarAlunosPorNivel('MÉDIO', 'EM DESENVOLVIMENTO')}</p>
                </div>
                <i className="fas fa-chart-line icon-bg"></i>
              </div>
            </div>
          </section>

          {/* ENSINO FUNDAMENTAL */}
          <section className="section-container">
            <h2 className="section-title-2"><i className="fas fa-book"></i> ENSINO FUNDAMENTAL</h2>
            <div className="dash-grid">
              <div className="stats-card">
                <div className="stats-info">
                  <h3>TOTAL ALUNOS</h3>
                  <p className="stats-number">{contarAlunosPorAno('FUNDAMENTAL')}</p>
                </div>
                <i className="fas fa-users icon-bg"></i>
              </div>

              <div className="stats-card apto">
                <div className="stats-info">
                  <h3>APTOS</h3>
                  <p className="stats-number">{filtrarAlunosPorNivel('FUNDAMENTAL', 'APTO')}</p>
                </div>
                <i className="fas fa-check-circle icon-bg"></i>
              </div>

              <div className="stats-card inapto">
                <div className="stats-info">
                  <h3>INAPTOS</h3>
                  <p className="stats-number">{filtrarAlunosPorNivel('FUNDAMENTAL', 'INAPTO')}</p>
                </div>
                <i className="fas fa-times-circle icon-bg"></i>
              </div>

              <div className="stats-card desenvolvimento">
                <div className="stats-info">
                  <h3>EM DESENVOLVIMENTO</h3>
                  <p className="stats-number">{filtrarAlunosPorNivel('FUNDAMENTAL', 'EM DESENVOLVIMENTO')}</p>
                </div>
                <i className="fas fa-chart-line icon-bg"></i>
              </div>
            </div>
          </section>

          {/* RANKING DE COMPETÊNCIAS */}
          <section className="section-container ranking-section">
            <h2 className="section-title-2"><i className="fas fa-trophy"></i> RANKING DE COMPETÊNCIAS</h2>
            
            <div className="ranking-tabs">
              <button 
                className={`ranking-tab ${activeRanking === 'geral' ? 'active' : ''}`} 
                onClick={() => showRanking('geral')}
              >
                GERAL
              </button>
              <button 
                className={`ranking-tab ${activeRanking === 'medio' ? 'active' : ''}`} 
                onClick={() => showRanking('medio')}
              >
                ENSINO MÉDIO
              </button>
              <button 
                className={`ranking-tab ${activeRanking === 'fundamental' ? 'active' : ''}`} 
                onClick={() => showRanking('fundamental')}
              >
                ENSINO FUNDAMENTAL
              </button>
            </div>

            {/* Ranking Geral */}
            <div className={`ranking-content ${activeRanking === 'geral' ? 'active' : ''}`}>
              {rankingGeral.length > 0 ? (
                <div className="ranking-list">
                  {rankingGeral.map((comp, index) => (
                    <div key={index} className="ranking-item">
                      <div className={`ranking-position ${getPositionClass(index)}`}>
                        {index + 1}º
                      </div>
                      <div className="ranking-info">
                        <h4>{comp.nome}</h4>
                        <p>{comp.total_avaliacoes} avaliações</p>
                      </div>
                      <div className="ranking-media">
                        <span className={`media-nota ${getMediaClass(comp.media)}`}>
                          {comp.media.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-ranking">
                  <i className="fas fa-chart-bar"></i>
                  <p>Nenhuma competência avaliada ainda</p>
                </div>
              )}
            </div>

            {/* Ranking Médio */}
            <div className={`ranking-content ${activeRanking === 'medio' ? 'active' : ''}`}>
              {rankingMedio.length > 0 ? (
                <div className="ranking-list">
                  {rankingMedio.map((comp, index) => (
                    <div key={index} className="ranking-item">
                      <div className={`ranking-position ${getPositionClass(index)}`}>
                        {index + 1}º
                      </div>
                      <div className="ranking-info">
                        <h4>{comp.nome}</h4>
                        <p>{comp.total_avaliacoes} avaliações</p>
                      </div>
                      <div className="ranking-media">
                        <span className={`media-nota ${getMediaClass(comp.media)}`}>
                          {comp.media.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-ranking">
                  <i className="fas fa-chart-bar"></i>
                  <p>Nenhuma competência avaliada no Ensino Médio</p>
                </div>
              )}
            </div>

            {/* Ranking Fundamental */}
            <div className={`ranking-content ${activeRanking === 'fundamental' ? 'active' : ''}`}>
              {rankingFundamental.length > 0 ? (
                <div className="ranking-list">
                  {rankingFundamental.map((comp, index) => (
                    <div key={index} className="ranking-item">
                      <div className={`ranking-position ${getPositionClass(index)}`}>
                        {index + 1}º
                      </div>
                      <div className="ranking-info">
                        <h4>{comp.nome}</h4>
                        <p>{comp.total_avaliacoes} avaliações</p>
                      </div>
                      <div className="ranking-media">
                        <span className={`media-nota ${getMediaClass(comp.media)}`}>
                          {comp.media.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-ranking">
                  <i className="fas fa-chart-bar"></i>
                  <p>Nenhuma competência avaliada no Ensino Fundamental</p>
                </div>
              )}
            </div>
          </section>
        </main>

        <footer className="dash-footer">
          <div className="footer-actions">
            <Link to="/professor/notas" className="btn-secondary-dash">
            <i className="fas fa-pencil-alt"></i> GERENCIAR COMPETÊNCIAS
            </Link>
            <Link to="/professor/graficos" className="btn-secondary-dash">
            <i className="fas fa-chart-pie"></i> VER ESTATÍSTICAS
            </Link>
            <Link to="/manual/professor" className="btn-secondary-dash">
            <i className="fas fa-book-open"></i> VER MANUAL
            </Link>
          </div>
          <div className="footer-credits">
            <p>© 2026 AnalisAI — SENAI Duque de Caxias.</p>
            <Link to="/dashboard/equipe"><p>Time de desenvolvedores</p></Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PortalProfessor;