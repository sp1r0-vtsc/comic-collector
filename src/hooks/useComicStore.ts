import { useState, useEffect } from 'react';
import { Comic } from '../types/comic';

export function useComicStore() {
  const [comics, setComics] = useState<Comic[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('comics');
    if (stored) {
      setComics(JSON.parse(stored));
    }
  }, []);

  const addComic = (comic: Comic) => {
    const newComics = [...comics, { ...comic, id: crypto.randomUUID() }];
    setComics(newComics);
    localStorage.setItem('comics', JSON.stringify(newComics));
  };

  const updateComic = (comic: Comic) => {
    const newComics = comics.map(c => c.id === comic.id ? comic : c);
    setComics(newComics);
    localStorage.setItem('comics', JSON.stringify(newComics));
  };

  const deleteComic = (id: string) => {
    const newComics = comics.filter(c => c.id !== id);
    setComics(newComics);
    localStorage.setItem('comics', JSON.stringify(newComics));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(comics, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = 'comics-export.json';
    link.click();
  };

  const importData = async (file: File) => {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      setComics(imported);
      localStorage.setItem('comics', JSON.stringify(imported));
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Invalid import file');
    }
  };

  return {
    comics,
    addComic,
    updateComic,
    deleteComic,
    exportData,
    importData
  };
}