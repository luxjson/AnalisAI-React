import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Termos from './pages/Termos/Termos';
import EsqueciSenha from './pages/Login/EsqueciSenha';

import Dashboard from './pages/Dashboard/Dashboard';
import DashboardEditor from './pages/Dashboard/Edit';
import DashboardTarefas from './pages/Dashboard/Tarefas';
import DashboardRelatorios from './pages/Dashboard/Relatorios';
import DashboardCalendario from './pages/Dashboard/Calendario'
import DashboardUsuarios from './pages/Dashboard/Usuarios';
import DashboardConfig from './pages/Dashboard/Config';

import ErroPage from './pages/Erro/ErroPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/esquecisenha" element={<EsqueciSenha />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/edit" element={<DashboardEditor />} />
        <Route path="/dashboard/tarefas" element={<DashboardTarefas />} />
        <Route path="/dashboard/relatorios" element={<DashboardRelatorios />} />
        <Route path="/dashboard/calendario" element={<DashboardCalendario />} />
        <Route path="/dashboard/usuarios" element={<DashboardUsuarios />} />
        <Route path="/dashboard/config" element={<DashboardConfig />} />

        <Route path="*" element={<ErroPage />} />
      </Routes>
    </Router>
  );
}

export default App;