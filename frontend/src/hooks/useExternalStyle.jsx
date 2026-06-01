import { useEffect } from 'react';

const useExternalStyle = (...fileNames) => {
  useEffect(() => {
    // Se não houver arquivos, não faz nada
    if (fileNames.length === 0) return;

    // Função para criar e adicionar o link
    const addStyle = (fileName) => {
      if (!fileName) return;

      // Resolve o caminho baseado na pasta assets/styles
      // Nota: Ajuste o caminho se o fileName já vier com "/" no início
      const cssUrl = new URL(`../styles/${fileName}`, import.meta.url).href;

      // Verifica se o link já existe para evitar duplicatas
      const existingLink = document.querySelector(`link[data-dynamic-css="${fileName}"]`);
      
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        link.type = 'text/css';
        link.dataset.dynamicCss = fileName;
        document.head.appendChild(link);
      }
    };

    // Função para remover o link
    const removeStyle = (fileName) => {
      const linkToRemove = document.querySelector(`link[data-dynamic-css="${fileName}"]`);
      if (linkToRemove && document.head.contains(linkToRemove)) {
        document.head.removeChild(linkToRemove);
      }
    };

    // Adiciona todos os estilos passados
    fileNames.forEach(addStyle);

    // Cleanup: Remove todos os estilos quando o componente desmontar
    return () => {
      fileNames.forEach(removeStyle);
    };
    // Usamos o join para que o useEffect reconheça mudanças no array de strings
  }, [JSON.stringify(fileNames)]); 
};

export default useExternalStyle;