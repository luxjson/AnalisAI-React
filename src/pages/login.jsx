import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import useDynamicCSS from '../hooks/useDynamicCSS';


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useDynamicCSS('/CSS/login.css');
  const [tipo, setTipo] = useState('professor');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form data professor
  const [professorData, setProfessorData] = useState({
    usuario: '',
    senha: ''
  });
  
  // Form data aluno
  const [alunoData, setAlunoData] = useState({
    matricula: '',
    email: '',
    senha: ''
  });

  // Verificar se tem mensagens na location state
  useEffect(() => {
    if (location.state?.error_msg) {
      setErrorMsg(location.state.error_msg);
    }
    if (location.state?.success_msg) {
      setSuccessMsg(location.state.success_msg);
    }
  }, [location]);

  const switchTab = (novoTipo) => {
    setTipo(novoTipo);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleProfessorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      const response = await api.post('/login/professor', professorData);
      if (response.data.success) {
        toast.success(`Bem-vindo, ${response.data.user.nome}!`);
        navigate('/professor/portal');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao fazer login');
      toast.error(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleAlunoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    if (!alunoData.matricula && !alunoData.email) {
      setErrorMsg('Informe matrícula ou e-mail');
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.post('/login/aluno', alunoData);
      if (response.data.success) {
        toast.success(`Bem-vindo, ${response.data.aluno.nome}!`);
        navigate('/aluno/portal');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao fazer login');
      toast.error(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botão Voltar */}
      <Link to="/" className="btn-secondary-dash back-button" style={{ textDecoration: 'none', color: 'white' }}>
        <i className="fas fa-undo-alt"></i> VOLTAR
      </Link>

      <div className="page">
        <div className="logo-analisai">
          <img 
            src={tipo === 'professor' ? '/IMG/logo3-white.png' : '/IMG/logo3-green.png'} 
            alt="AnalisAI" 
            id="logoimg"
          />
        </div>

        <div className="login-container">
          
          {/* Mensagens de erro/sucesso */}
          {errorMsg && (
            <div className="erro-box">
              {errorMsg}
            </div>
          )}
          
          {successMsg && (
            <div className="success-box">
              {successMsg}
            </div>
          )}

          {/* Tabs */}
          <div className="login-tabs">
            <div 
              className={`login-tab professor ${tipo === 'professor' ? 'active' : ''}`} 
              onClick={() => switchTab('professor')}
            >
              <i className="fas fa-chalkboard-teacher"></i> PROFESSOR
            </div>
            <div 
              className={`login-tab aluno ${tipo === 'aluno' ? 'active' : ''}`} 
              onClick={() => switchTab('aluno')}
            >
              <i className="fas fa-user-graduate"></i> ALUNO
            </div>
          </div>

          {/* Form Professor */}
          <div className={`login-form professor ${tipo === 'professor' ? 'active' : ''}`} id="professorForm">
            <form onSubmit={handleProfessorSubmit}>
              <div className="input-group">
                <input 
                  type="text" 
                  name="usuario" 
                  placeholder="E-MAIL" 
                  required
                  value={professorData.usuario}
                  onChange={(e) => setProfessorData({...professorData, usuario: e.target.value})}
                />
              </div>
              <div className="input-group">
                <input 
                  type="password" 
                  name="senha" 
                  placeholder="SENHA" 
                  required
                  value={professorData.senha}
                  onChange={(e) => setProfessorData({...professorData, senha: e.target.value})}
                />
              </div>
              <button type="submit" className="a" disabled={loading}>
                {loading ? 'ENTRANDO...' : 'ENTRAR'}
              </button>
            </form>
            <Link to="/passwordreset" className="link-esqueci">Esqueci minha senha</Link>
          </div>

          {/* Form Aluno */}
          <div className={`login-form aluno ${tipo === 'aluno' ? 'active' : ''}`} id="alunoForm">
            <form onSubmit={handleAlunoSubmit}>
              <div className="info-box">
                <i className="fas fa-info-circle"></i>
                Use matrícula ou e-mail
              </div>
              <div className="input-group-2">
                <input 
                  type="text" 
                  name="matricula" 
                  placeholder="MATRÍCULA"
                  value={alunoData.matricula}
                  onChange={(e) => setAlunoData({...alunoData, matricula: e.target.value})}
                />
              </div>
              <div className="input-group-2">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="E-MAIL"
                  value={alunoData.email}
                  onChange={(e) => setAlunoData({...alunoData, email: e.target.value})}
                />
              </div>
              <div className="input-group-2">
                <input 
                  type="password" 
                  name="senha" 
                  placeholder="SENHA" 
                  required
                  value={alunoData.senha}
                  onChange={(e) => setAlunoData({...alunoData, senha: e.target.value})}
                />
              </div>
              <button type="submit" className="b" disabled={loading}>
                {loading ? 'ENTRANDO...' : 'ENTRAR COMO ALUNO'}
              </button>
            </form>
          </div>
          
        </div>

        <footer className="footer-terms">
          <Link to="/termos" className="termos">
            <span>TERMOS DE SERVIÇO</span>
          </Link>
        </footer>
      </div>
    </>
  );
};

export default Login;