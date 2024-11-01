import { useState, useEffect, useMemo } from 'react';
import { Comic, Collection, GroupBy } from '../types/comic';

interface UseCollectionsReturn {
  collections: Collection[];
  addCollection: (name: string, description?: string) => void;
  removeCollection: (id: string) => void;
  addComicToCollection: (collectionId: string, comicId: string) => void;
  removeComicFromCollection: (collectionId: string, comicId: string) => void;
  getCollectionsByComic: (comicId: string) => Collection[];
  updateCollection: (collection: Collection) => void;
}

export function useCollections(): UseCollectionsReturn {
  const [collections, setCollections] = useState<Collection[]>(() => {
    const stored = localStorage.getItem('collections');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('collections', JSON.stringify(collections));
  }, [collections]);

  const addCollection = (name: string, description?: string) => {
    setCollections(prev => [...prev, {
      id: crypto.randomUUID(),
      name,
      description,
      comicIds: []
    }]);
  };

  const removeCollection = (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
  };

  const addComicToCollection = (collectionId: string, comicId: string) => {
    setCollections(prev => prev.map(c => 
      c.id === collectionId && !c.comicIds.includes(comicId)
        ? { ...c, comicIds: [...c.comicIds, comicId] }
        : c
    ));
  };

  const removeComicFromCollection = (collectionId: string, comicId: string) => {
    setCollections(prev => prev.map(c => 
      c.id === collectionId
        ? { ...c, comicIds: c.comicIds.filter(id => id !== comicId) }
        : c
    ));
  };

  const getCollectionsByComic = (comicId: string) => {
    return collections.filter(c => c.comicIds.includes(comicId));
  };

  const updateCollection = (collection: Collection) => {
    setCollections(prev => prev.map(c => 
      c.id === collection.id ? collection : c
    ));
  };

  return {
    collections,
    addCollection,
    removeCollection,
    addComicToCollection,
    removeComicFromCollection,
    getCollectionsByComic,
    updateCollection
  };
}