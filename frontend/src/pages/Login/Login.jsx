import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useExternalStyle from '../../hooks/useExternalStyle';
import api from '../../services/api';

export default function Login() {
    useExternalStyle('login.css', 'dashboard.css');
    
    const navigate = useNavigate();

    // Estados de controle da interface
    const [tipo, setTipo] = useState('professor'); 
    const [error_msg, setErrorMsg] = useState(''); 
    const [success_msg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Estado dos campos do formulário
    const [formData, setFormData] = useState({
        usuario: '', // para professor
        matricula: '', // para aluno
        email: '', // para aluno
        senha: ''
    });

    // Atualiza o estado conforme o usuário digita
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Troca entre aba Professor e Aluno
    const handleSwitchTab = (novoTipo) => {
        setTipo(novoTipo);
        setErrorMsg('');
        setSuccessMsg('');
        // Limpa a senha ao trocar de aba por segurança
        setFormData(prev => ({ ...prev, senha: '' }));
    };

    // FUNÇÃO PRINCIPAL: Envio dos dados para o Backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        try {
            // Define a rota baseada na aba ativa
            const endpoint = tipo === 'professor' ? '/login/professor' : '/login/aluno';
            
            // Faz a requisição para o Express
            const response = await api.post(endpoint, formData);

            if (response.data) {
                
                // Salva os dados do usuário e o cargo no localStorage para as outras páginas usarem
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('userCargo', response.data.user.cargo || (tipo === 'professor' ? 'Professor' : 'Aluno'));

                // Redireciona após 1.5 segundos para o usuário ver a mensagem de sucesso
                setTimeout(() => {
                    if (tipo === 'professor') {
                        navigate('/dashboard');
                    } else {
                        navigate('/aluno');
                    }
                }, 1500);
            }
        } catch (err) {
            // Captura a mensagem de erro vinda do Express (res.status(401).json({message: '...'}))
            const mensagem = err.response?.data?.message || 'Erro desconhecido.';
            setErrorMsg(mensagem);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dash-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', minHeight: '100vh' }}>
            
            <div className="login-wrapper">
                
                <div style={{ marginBottom: '20px' }}>
                    <Link to="/" className="btn-secondary-dash" style={{ textDecoration: 'none' }}>
                        <i className="fas fa-undo-alt"></i> VOLTAR
                    </Link>
                </div>

                <div className="login-card">
                    <div className="login-logo">
                        <img 
                            src={tipo === 'professor' ? "/IMG/logo3-white.png" : "/IMG/logo3-green.png"} 
                            alt="AnalisAI" 
                            id="logoimg" 
                        />
                    </div>

                    {/* Alertas dinâmicos */}
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

                    <div className="login-tabs">
                        <button 
                            className={`login-tab professor ${tipo === 'professor' ? 'active' : ''}`} 
                            onClick={() => handleSwitchTab('professor')}
                            disabled={loading}
                        >
                            PROFESSOR
                        </button>
                        <button 
                            className={`login-tab aluno ${tipo === 'aluno' ? 'active' : ''}`} 
                            onClick={() => handleSwitchTab('aluno')}
                            disabled={loading}
                        >
                            ALUNO
                        </button>
                    </div>

                    {/* FORMULÁRIO PROFESSOR */}
                    <div className={`login-form professor ${tipo === 'professor' ? 'active' : ''}`} id="professorForm">
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    name="usuario" 
                                    placeholder="E-MAIL INSTITUCIONAL" 
                                    value={formData.usuario}
                                    onChange={handleChange}
                                    onInput={(e) => e.target.value = e.target.value.toLowerCase()} 
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <input 
                                    type="password" 
                                    name="senha" 
                                    placeholder="SENHA" 
                                    value={formData.senha}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn-secondary-dash" style={{ justifyContent: 'center' }} disabled={loading}>
                                {loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
                            </button>
                        </form>
                        <Link to="/esquecisenha" className="link-esqueci">Esqueci minha senha</Link>
                    </div>

                    {/* FORMULÁRIO ALUNO */}
                    <div className={`login-form aluno ${tipo === 'aluno' ? 'active' : ''}`} id="alunoForm">
                        <div className="info-box-login">
                            <i className="fas fa-info-circle"></i> Use sua matrícula ou e-mail cadastrado
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="input-group input-group-aluno">
                                <input 
                                    type="text" 
                                    name="matricula" 
                                    placeholder="MATRÍCULA" 
                                    value={formData.matricula}
                                    onChange={handleChange}
                                    onInput={(e) => e.target.value = e.target.value.toLowerCase()} 
                                />
                            </div>
                            <div className="input-group input-group-aluno">
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="E-MAIL" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    onInput={(e) => e.target.value = e.target.value.toLowerCase()} 
                                />
                            </div>
                            <div className="input-group input-group-aluno">
                                <input 
                                    type="password" 
                                    name="senha" 
                                    placeholder="SENHA" 
                                    value={formData.senha}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn-secondary-dash" style={{ justifyContent: 'center' }} disabled={loading}>
                                {loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
                            </button>
                        </form>
                    </div>
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