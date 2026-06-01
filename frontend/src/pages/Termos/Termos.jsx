import React from 'react';
import { useNavigate } from 'react-router-dom';

// Importa o CSS original
import useExternalStyle from '../../hooks/useExternalStyle';

export default function Termos() {
    // Hook do React Router para simular o history.back()
    const navigate = useNavigate();
    useExternalStyle('termos.css', 'dashboard.css');


    return (
        <div className="dash-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', minHeight: '100vh' }}>
            
            <div className="login-wrapper">
                <div className="login-card">
                    
                    <div className="termos-header">
                        <img src="/IMG/logo3-white.png" alt="AnalisAI" style={{ height: '40px' }} />
                        <h2>Termos de Serviço</h2>
                    </div>

                    <div className="termos-scroller">
                        <p>
                            <strong>1. Aceitação:</strong> Ao acessar o AnalisAI, você concorda com estes Termos. Se não concordar, não utilize a plataforma.
                        </p>
                        
                        <p>
                            <strong>2. Uso do Sistema:</strong> O AnalisAI é uma ferramenta de análise de avanços educacionais. O serviço pode ser modificado ou descontinuado a qualquer momento visando a melhoria da experiência pedagógica.
                        </p>
                        
                        <p>
                            <strong>3. Conta e Segurança:</strong> Você é responsável por manter seus dados de acesso seguros. Qualquer atividade na sua conta é de sua inteira responsabilidade. Recomendamos o uso de senhas fortes.
                        </p>
                        
                        <p>
                            <strong>4. Propriedade Intelectual:</strong> Todo o conteúdo do AnalisAI pertence ao SENAI. É proibido copiar, vender ou usar comercialmente qualquer parte desta interface ou lógica de dados sem autorização prévia.
                        </p>
                        
                        <p>
                            <strong>5. Limitação de Responsabilidade:</strong> O sistema é fornecido "como está". O SENAI não se responsabiliza por decisões tomadas exclusivamente com base nas análises automáticas geradas, sendo estas ferramentas de apoio ao docente.
                        </p>
                        
                        <p>
                            <strong>6. Proteção de Dados:</strong> O tratamento de dados pessoais de alunos e professores segue rigorosamente a LGPD, sendo utilizados estritamente para fins educacionais e de monitoramento de competências.
                        </p>
                    </div>

                    <div className="button-area">
                        {/* No React, para voltar uma página como o javascript:history.back(), usamos o navigate(-1) */}
                        <button 
                            onClick={() => navigate(-1)} 
                            className="btn-secondary-dash" 
                            style={{ textDecoration: 'none', padding: '12px 40px', cursor: 'pointer', background: 'transparent' }}
                        >
                            <i className="fas fa-arrow-left"></i> VOLTAR
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}