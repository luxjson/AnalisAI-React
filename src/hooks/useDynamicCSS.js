import { useEffect } from 'react';

const useDynamicCSS = (cssPaths) => {
  useEffect(() => {
    // Converte string única em array
    const paths = Array.isArray(cssPaths) ? cssPaths : [cssPaths];
    const links = [];
    
    paths.forEach((cssPath, index) => {
      // Verifica se já existe um link com esse href
      const existingLink = document.querySelector(`link[href="${cssPath}"]`);
      if (existingLink) {
        existingLink.remove();
      }
      
      // Cria novo link
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssPath;
      link.id = `css-${index}-${cssPath.replace(/[^a-zA-Z]/g, '')}`;
      
      // Adiciona no head
      document.head.appendChild(link);
      links.push(link);
    });
    
    // Quando o componente desmontar, remove os CSS
    return () => {
      links.forEach(link => {
        if (link && link.parentNode) {
          link.remove();
        }
      });
    };
  }, [cssPaths]);
};

export default useDynamicCSS;