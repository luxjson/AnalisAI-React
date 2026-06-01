import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SidebarProfessor from '../../components/layout/SidebarProfessor';
import useExternalStyle from '../../hooks/useExternalStyle';
import Chart from 'chart.js/auto';

export default function DashboardRelatorios({ 
    user = "Professor", 
    userCargo = "Professor", 
    stats = { 
        total: 0, 
        apto: 0, 
        inapto: 0, 
        mediaMedio: 0, 
        mediaFundamental: 0 
    } 
}) {
    // Carrega exatamente os CSS que o EJS utilizava
    useExternalStyle('sidebar.css', 'dashboard.css', 'graficos.css');
    
    const navigate = useNavigate();

    // Refs para armazenar as instâncias dos gráficos e evitar duplicidade
    const chartsRef = useRef({});

    useEffect(() => {
        if (stats.total > 0) {
            const desenvolvimento = stats.total - stats.apto - stats.inapto;

            const commonOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            };

            const barOptions = {
                ...commonOptions,
                scales: {
                    y: { 
                        beginAtZero: true, 
                        max: 10,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#888', stepSize: 2 }
                    },
                    x: { 
                        grid: { display: false },
                        ticks: { color: '#888' }
                    }
                }
            };

            // Função auxiliar para destruir gráfico existente antes de criar novo
            const renderChart = (id, config) => {
                if (chartsRef.current[id]) {
                    chartsRef.current[id].destroy();
                }
                const ctx = document.getElementById(id);
                if (ctx) {
                    chartsRef.current[id] = new Chart(ctx, config);
                }
            };

            // 1. Gráfico de Aptos
            renderChart('chartAptos', {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [stats.apto, stats.total - stats.apto],
                        backgroundColor: ['#217346', '#131314'],
                        borderWidth: 0,
                        cutout: '75%',
                        borderRadius: 6
                    }]
                },
                options: commonOptions
            });

            // 2. Gráfico de Inaptos
            renderChart('chartInaptos', {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [stats.inapto, stats.total - stats.inapto],
                        backgroundColor: ['#ff0101', '#131314'],
                        borderWidth: 0,
                        cutout: '75%',
                        borderRadius: 6
                    }]
                },
                options: commonOptions
            });

            // 3. Gráfico de Desenvolvimento
            renderChart('chartDesenvolvimento', {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [desenvolvimento, stats.total - desenvolvimento],
                        backgroundColor: ['#d4a017', '#131314'],
                        borderWidth: 0,
                        cutout: '75%',
                        borderRadius: 6
                    }]
                },
                options: commonOptions
            });

            // 4. Gráfico Ensino Médio
            if (stats.mediaMedio !== undefined) {
                renderChart('chartMedio', {
                    type: 'bar',
                    data: {
                        labels: ['MÉDIA GERAL'],
                        datasets: [{
                            data: [stats.mediaMedio],
                            backgroundColor: 'rgba(255, 1, 1, 0.3)',
                            borderColor: '#ff0101',
                            borderWidth: 2,
                            borderRadius: 8,
                            barPercentage: 0.4,
                            categoryPercentage: 0.6
                        }]
                    },
                    options: barOptions
                });
            }

            // 5. Gráfico Ensino Fundamental
            if (stats.mediaFundamental !== undefined) {
                renderChart('chartFundamental', {
                    type: 'bar',
                    data: {
                        labels: ['MÉDIA GERAL'],
                        datasets: [{
                            data: [stats.mediaFundamental],
                            backgroundColor: 'rgba(255, 1, 1, 0.3)',
                            borderColor: '#ff0101',
                            borderWidth: 2,
                            borderRadius: 8,
                            barPercentage: 0.4,
                            categoryPercentage: 0.6
                        }]
                    },
                    options: barOptions
                });
            }
        }

        // Cleanup ao desmontar o componente
        return () => {
            Object.values(chartsRef.current).forEach(chart => chart.destroy());
        };
    }, [stats]);

    const atualizarGraficos = () => {
        // No React, em vez de reload, você chamaria a função que busca os dados da API novamente
        window.location.reload();
    };

    return (
        <div className="dash-body">
            <SidebarProfessor userCargo={userCargo} />

            <div className="main-layout" style={{ padding: '40px 60px' }}>
                <header className="dash-header">
                    <div className="header-left">
                        <h1>Relatórios</h1>
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

                <main className="dash-content graficos-grid">
                    <p className="section-label">PANORAMA DE NÍVEIS</p>
                    
                    <div className="row-triple">
                        <div className="dash-card card-grafico">
                            {stats.total > 0 ? (
                                <>
                                    <canvas id="chartAptos"></canvas>
                                    <p className="chart-label label-verde">ALUNOS APTOS</p>
                                    <p className="chart-value">{stats.apto}</p>
                                </>
                            ) : <div className="empty-chart">SEM DADOS PARA EXIBIR</div>}
                        </div>

                        <div className="dash-card card-grafico">
                            {stats.total > 0 ? (
                                <>
                                    <canvas id="chartInaptos"></canvas>
                                    <p className="chart-label label-vermelho">ALUNOS INAPTOS</p>
                                    <p className="chart-value">{stats.inapto}</p>
                                </>
                            ) : <div className="empty-chart">SEM DADOS PARA EXIBIR</div>}
                        </div>

                        <div className="dash-card card-grafico">
                            {stats.total > 0 ? (
                                <>
                                    <canvas id="chartDesenvolvimento"></canvas>
                                    <p className="chart-label label-amarelo">EM DESENVOLVIMENTO</p>
                                    <p className="chart-value">{stats.total - stats.apto - stats.inapto}</p>
                                </>
                            ) : <div className="empty-chart">SEM DADOS PARA EXIBIR</div>}
                        </div>
                    </div>

                    <p className="section-label">DESEMPENHO MÉDIO — ENSINO MÉDIO</p>
                    <div className="dash-card card-grafico-large">
                        {stats.mediaMedio !== undefined && stats.total > 0 ? (
                            <>
                                <canvas id="chartMedio"></canvas>
                                <p className="chart-value-large">{stats.mediaMedio}</p>
                            </>
                        ) : <div className="empty-chart">NENHUM DADO DISPONÍVEL</div>}
                    </div>

                    <p className="section-label">DESEMPENHO MÉDIO — ENSINO FUNDAMENTAL</p>
                    <div className="dash-card card-grafico-small">
                        {stats.mediaFundamental !== undefined && stats.total > 0 ? (
                            <>
                                <canvas id="chartFundamental"></canvas>
                                <p className="chart-value-large">{stats.mediaFundamental}</p>
                            </>
                        ) : <div className="empty-chart">NENHUM DADO DISPONÍVEL</div>}
                    </div>
                </main>

                <footer className="dash-footer">
                    <div className="footer-actions">
                        <Link to="/dashboard/edit" className="btn-secondary-dash">
                            <i className="fas fa-arrow-left"></i> VOLTAR AO EDITOR
                        </Link>
                        <button onClick={atualizarGraficos} className="btn-secondary-dash">
                            <i className="fas fa-sync-alt"></i> ATUALIZAR
                        </button>
                    </div>
                    <div className="footer-credits">
                        <p>© 2026 AnalisAI</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}