import React from 'react';
import { Comic } from '../types/comic';
import { Grid, List } from 'lucide-react';

interface ComicGridProps {
  comics: Comic[];
  viewMode: 'grid' | 'list';
  onComicSelect: (comic: Comic) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

export function ComicGrid({ comics, viewMode, onComicSelect, setViewMode }: ComicGridProps) {
  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Comic Collection</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      <div className={`
        ${viewMode === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6' 
          : 'flex flex-col gap-4'}
      `}>
        {comics.map((comic) => (
          <div
            key={comic.id}
            onClick={() => onComicSelect(comic)}
            className={`
              cursor-pointer transition-transform duration-200 hover:scale-102
              ${viewMode === 'grid' 
                ? 'bg-white rounded-lg shadow-md overflow-hidden'
                : 'bg-white rounded-lg shadow-md p-4 flex gap-4'}
            `}
          >
            <img
              src={comic.coverImage || 'https://images.unsplash.com/photo-1610500795224-fb86b02926d7?w=400'}
              alt={`${comic.series} #${comic.issueNumber}`}
              className={`
                object-cover
                ${viewMode === 'grid' 
                  ? 'w-full aspect-[2/3]' 
                  : 'w-24 h-36 rounded'}
              `}
            />
            <div className={viewMode === 'grid' ? 'p-4' : ''}>
              <h3 className="font-semibold text-gray-800">{comic.series}</h3>
              <p className="text-sm text-gray-600">#{comic.issueNumber}</p>
              <p className="text-sm text-gray-600">{comic.publisher}</p>
              {viewMode === 'list' && (
                <>
                  <p className="text-sm text-gray-600">{comic.publicationDate}</p>
                  <p className="text-sm text-gray-600">Condition: {comic.condition}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}