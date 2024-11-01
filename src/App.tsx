import React, { useState } from 'react';
import { Comic, ViewMode } from './types/comic';
import { useComicStore } from './hooks/useComicStore';
import { ComicGrid } from './components/ComicGrid';
import { ComicCollections } from './components/ComicCollections';
import { Library, Upload, Grid, Layers } from 'lucide-react';
import { UploadModal } from './components/UploadModal';

function App() {
  const { comics } = useComicStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'grid' | 'collections'>('collections');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Library className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Comic Catalog</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('grid')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    activeView === 'grid'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                  <span className="hidden sm:inline">Grid View</span>
                </button>
                <button
                  onClick={() => setActiveView('collections')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    activeView === 'collections'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span className="hidden sm:inline">Collections</span>
                </button>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Comics
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'grid' ? (
          <ComicGrid
            comics={comics}
            viewMode={viewMode}
            onComicSelect={setSelectedComic}
            setViewMode={setViewMode}
          />
        ) : (
          <ComicCollections />
        )}
      </main>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}

export default App;