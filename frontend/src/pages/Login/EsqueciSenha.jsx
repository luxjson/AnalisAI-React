import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useExternalStyle from '../../hooks/useExternalStyle'; // Ajuste o caminho do seu hook

export default function EsqueciSenha() {
    // Carrega os estilos dinamicamente usando o seu hook atualizado
    useExternalStyle('dashboard.css', 'esquecisenha.css');

    // Estados para simular as mensagens de erro/sucesso do EJS
    const [error_msg, setErrorMsg] = useState('');
    const [success_msg, setSuccessMsg] = useState('');

    return (
        <div className="dash-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', minHeight: '100vh' }}>
            
            <div className="login-wrapper">
                <div style={{ marginBottom: '20px' }}>
                    <Link to="/login" className="btn-secondary-dash" style={{ textDecoration: 'none' }}>
                        <i className="fas fa-undo-alt"></i> VOLTAR
                    </Link>
                </div>

                <div className="login-card">
                    <div className="login-logo">
                        <img src="/IMG/logo3-white.png" alt="AnalisAI" />
                    </div>

                    <h2 className="page-title">Recuperar Senha</h2>

                    {/* Alertas idênticos ao EJS */}
                    {error_msg && (
                        <div className="alert-box error">
                            <i className="fas fa-exclamation-circle"></i> {error_msg}
                        </div>
                    )}
                    {success_msg && (
                        <div className="alert-box success">
                            <i className="fas fa-check-circle"></i> {success_msg}
                        </div>
                    )}

                    <div className="info-box-login">
                        <i className="fas fa-info-circle"></i> Informe seu e-mail para solicitar a redefinição da sua senha.
                    </div>

                    <form action="/esquecisenha/solicitar" method="POST">
                        <div className="input-group">
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="SEU E-MAIL CADASTRADO" 
                                onInput={(e) => e.target.value = e.target.value.toLowerCase()} 
                                required 
                            />
                        </div>
                        
                        <button type="submit" className="btn-login">
                            SOLICITAR REDEFINIÇÃO
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '25px', color: '#555', fontSize: '0.8rem' }}>
                        Um administrador será notificado para validar seu pedido.
                    </p>
                </div>

                <footer style={{ marginTop: '30px', textAlign: 'center' }}>
                    <Link to="/termos" className="btn-secondary-dash" style={{ fontSize: '0.7rem', border: 'none', background: 'transparent' }}>
                        TERMOS DE SERVIÇO
                    </Link>
                </footer>
            </div>

        </div>
    );
}