import { useState, useEffect } from 'react';

export const useDifficulty = (gameName, defaultDiff = 'Easy') => {
  const [difficulty, setDifficulty] = useState(() => {
    const saved = localStorage.getItem(`funflex_diff_${gameName}`);
    return saved || defaultDiff;
  });

  useEffect(() => {
    localStorage.setItem(`funflex_diff_${gameName}`, difficulty);
  }, [difficulty, gameName]);

  return [difficulty, setDifficulty];
};
