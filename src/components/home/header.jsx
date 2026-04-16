import React from 'react';
import { Link } from 'react-router-dom';
import '../../../public/CSS/home.css';
import '../../../public/CSS/header-home.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo-section">
        <Link to="/">
          <img src="/IMG/logo3-white.png" alt="Logo" className="logo-analisai" width="100px" height="27px" />
        </Link>
      </div>
      <nav className="navegacao-botoes">
        <Link to="/manual/professor" className="side-link" title="Manual do Professor">
          <i className="fas fa-chalkboard-user"></i>
        </Link>
        <Link to="/manual/aluno" className="side-link" title="Manual do Aluno">
          <i className="fas fa-user-graduate"></i>
        </Link>
        <Link to="/login" className="side-link" title="Entrar">
          <i className="fas fa-sign-in-alt"></i>
        </Link>
      </nav>
    </header>
  );
};

export default Header;