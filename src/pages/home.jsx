import React from 'react';
import { Link } from 'react-router-dom';

import '../../public/CSS/home.css';
import Header from '../components/home/header';

export default function Home() {
    return (
        <div className="home-container">
            <header className="site-header">
                <Header />
            </header>

            <main>
                <section className="section-1-presentaion">
                    <div className="titulo-s1">
                        {/* No Vite/React, imagens na pasta public são acessadas via / */}
                        <img src="/IMG/logo3-white.png" alt="AnalisAI" className="senai_logo" />
                        <h1>SISTEMA DE ANÁLISE DE AVANÇOS</h1>
                        <p>Organize, colabore e alcance seus objetivos com eficiência.</p>
                    </div>
                    {/* Substituímos <a> por <Link> para navegação SPA instantânea */}
                    <Link to="/login" className="botao-acessar">Acessar Sistema</Link>
                </section>

                <section className="section-2-about-senai-cic">
                    <div className="section-2-box1">
                        <div className="box-icon"><i className="fas fa-university"></i></div>
                        <h2>SENAI CIC</h2>
                        <p>Referência em formação profissional, o SENAI CIC atua como hub tecnológico preparando talentos para a Indústria 4.0.</p>
                    </div>

                    <div className="section-2-box1">
                        <div className="box-icon"><i className="fas fa-chart-line"></i></div>
                        <h2>ANÁLISE DE DADOS</h2>
                        <p>Transformamos avaliações complexas em indicadores visuais claros para identificar a aptidão de cada estudante.</p>
                    </div>

                    <div className="section-2-box1">
                        <div className="box-icon"><i className="fas fa-bullseye"></i></div>
                        <h2>RESULTADOS</h2>
                        <p>Acompanhe a evolução das turmas e garanta o sucesso acadêmico com decisões baseadas em dados organizados.</p>
                    </div>
                </section>

                <section className="features-section">
                    <h2 className="main-title">FUNCIONALIDADES ÚTEIS</h2>
                    <div className="features-grid">
                        <div className="feature-item">
                            <i className="fas fa-check-circle"></i>
                            <div>
                                <h3>Gestão de Notas</h3>
                                <p>Edição rápida e intuitiva de desempenho acadêmico.</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <i className="fas fa-chart-pie"></i>
                            <div>
                                <h3>Gráficos Dinâmicos</h3>
                                <p>Visualização instantânea de alunos aptos e inaptos.</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <i className="fas fa-file-export"></i>
                            <div>
                                <h3>Exportação de Dados</h3>
                                <p>Gere relatórios para otimizar suas reuniões de conselho.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="faq-section">
                    <h2 className="main-title">DÚVIDAS FREQUENTES</h2>
                    <div className="faq-container">
                        <details>
                            <summary>Como o nível do aluno é calculado?</summary>
                            <p>O sistema cruza a nota (mínima 7.0) com a presença (mínima 75%) para definir automaticamente entre Apto ou Inapto.</p>
                        </details>
                        <details>
                            <summary>O sistema é exclusivo para o SENAI?</summary>
                            <p>Atualmente foi desenvolvido como ferramenta interna para otimização de fluxos do SENAI CIC.</p>
                        </details>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="footer-content">
                    <p>© 2026 ANALISAI - SERVIÇO NACIONAL DE APRENDIZAGEM INDUSTRIAL</p>
                    <div className="footer-sub">
                        <span>Unidade SENAI CIC - Curitiba/PR</span>
                        <Link 
                            to="/termos" 
                            style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
                            >
                            Termos de Uso
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}