import { useState, useEffect } from 'react';
import { themes } from '../data/initialData.js';

export const useTheme = () => {
  const savedTheme = JSON.parse(localStorage.getItem('theme'));
  const [theme, setTheme] = useState(savedTheme || themes[0]);
  
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  return [theme, setTheme];
};
