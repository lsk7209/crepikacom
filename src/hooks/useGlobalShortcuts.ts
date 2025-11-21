import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToolsByCategory } from '@/data/tools-config';

export function useGlobalShortcuts() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const [gPressed, setGPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Handle '/' to focus search
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      // Handle '?' to toggle help
      if (e.key === '?') {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      // Handle 'g' prefix for navigation
      if (e.key === 'g') {
        setGPressed(true);
        setTimeout(() => setGPressed(false), 1000);
        return;
      }

      // Handle second key after 'g'
      if (gPressed) {
        e.preventDefault();
        if (e.key === 'p') {
          const planTools = getToolsByCategory('plan');
          if (planTools.length > 0) {
            navigate(planTools[0].path);
          }
        } else if (e.key === 'c') {
          const createTools = getToolsByCategory('create');
          if (createTools.length > 0) {
            navigate(createTools[0].path);
          }
        } else if (e.key === 'a') {
          const analyzeTools = getToolsByCategory('analyze');
          if (analyzeTools.length > 0) {
            navigate(analyzeTools[0].path);
          }
        }
        setGPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, gPressed]);

  return { showHelp, setShowHelp };
}
