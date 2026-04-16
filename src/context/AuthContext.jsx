import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [aluno, setAluno] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/me');
        if (response.data.type === 'professor') {
          setUser(response.data.user);
        } else if (response.data.type === 'aluno') {
          setAluno(response.data.aluno);
        }
      } catch (error) {
        console.log('Não autenticado');
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const loginProfessor = async (usuario, senha) => {
    try {
      const response = await api.post('/login/professor', { usuario, senha });
      setUser(response.data.user);
      toast.success(`Bem-vindo, ${response.data.user.nome}!`);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao fazer login');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const loginAluno = async (matricula, email, senha) => {
    try {
      const response = await api.post('/login/aluno', { matricula, email, senha });
      setAluno(response.data.aluno);
      toast.success(`Bem-vindo, ${response.data.aluno.nome}!`);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao fazer login');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const logout = async () => {
    await api.post('/logout');
    setUser(null);
    setAluno(null);
    toast.success('Logout realizado');
  };

  return (
    <AuthContext.Provider value={{
      user, aluno, loading, loginProfessor, loginAluno, logout,
      isAuthenticated: !!user || !!aluno,
      isAdmin: user?.cargo === 'Admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};