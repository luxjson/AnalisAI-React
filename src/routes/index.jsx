import { Route, Routes } from 'react-router-dom'

import Home from '../pages/home';
import Login from '../pages/login';
import Termos from '../pages/termos';
import PasswordReset from '../pages/passwordreset';
import ManualProfessor from '../pages/manual/manualprofessor';
import ManualAluno from '../pages/manual/manualaluno';
import Error404 from '../pages/404';

import PortalAluno from '../pages/aluno/portalaluno';
import AlunoNotas from '../pages/aluno/alunonotas';
import AlunoTarefas from '../pages/aluno/alunotarefas';
import AlunoEvolucao from '../pages/aluno/alunoevolucao';
import AlunoCompetencias from '../pages/aluno/alunocompetencias';
import AlunoConfig from '../pages/aluno/alunoconfig';

import PortalProfessor from '../pages/professor/portalprofessor';
import ProfessorNotas from '../pages/professor/professornotas';
import ProfessorTarefas from '../pages/professor/professortarefas';
import ProfessorGraficos from '../pages/professor/professorgraficos';
import ProfessorCalendario from '../pages/professor/professorcalendario';
import ProfessorConfig from '../pages/professor/professorconfig';

import AdminPwdResetRequest from '../pages/admin/adminpwdresetrequest';
import Admin from '../pages/admin/admin';

export default function Rotas() {
    return (
        <>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/termos" element={<Termos />} /> 
                <Route path="/passwordreset" element={<PasswordReset />} />
                <Route path="/manual/professor" element={<ManualProfessor />} />
                <Route path="/manual/aluno" element={<ManualAluno />} />

                <Route path="/aluno/portal" element={<PortalAluno />} />
                <Route path="/aluno/notas" element={<AlunoNotas />} />
                <Route path="/aluno/tarefas" element={<AlunoTarefas />} />
                <Route path="/aluno/evolucao" element={<AlunoEvolucao />} />
                <Route path="/aluno/competencias" element={<AlunoCompetencias />} />
                <Route path="/aluno/config" element={<AlunoConfig />} />

                <Route path="/professor/portal" element={<PortalProfessor />} />
                <Route path="/professor/notas" element={<ProfessorNotas />} />
                <Route path="/professor/tarefas" element={<ProfessorTarefas />} />
                <Route path="/professor/graficos" element={<ProfessorGraficos />} />
                <Route path="/professor/calendario" element={<ProfessorCalendario />} />
                <Route path="/professor/config" element={<ProfessorConfig />} />

                <Route path="/admin/pwdresetrequest" element={<AdminPwdResetRequest />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>

        </>
    )
}