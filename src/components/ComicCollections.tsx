import React, { useState, useMemo } from 'react';
import { Comic, GroupBy } from '../types/comic';
import { useComicStore } from '../hooks/useComicStore';
import { useCollections } from '../hooks/useCollections';
import { Layers, Tag, Filter, Search } from 'lucide-react';

interface ComicGroup {
  title: string;
  comics: Comic[];
}

export function ComicCollections() {
  const { comics } = useComicStore();
  const { collections, addCollection } = useCollections();
  const [groupBy, setGroupBy] = useState<GroupBy>('series');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    comics.forEach(comic => {
      comic.customTags?.forEach(tag => tags.add(tag));
      tags.add(comic.publisher);
      tags.add(comic.series);
      tags.add(new Date(comic.publicationDate).getFullYear().toString());
    });
    return Array.from(tags).sort();
  }, [comics]);

  const filteredComics = useMemo(() => {
    return comics.filter(comic => {
      const matchesSearch = searchTerm === '' || 
        comic.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comic.publisher.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => 
          comic.customTags?.includes(tag) ||
          comic.publisher === tag ||
          comic.series === tag ||
          new Date(comic.publicationDate).getFullYear().toString() === tag
        );

      return matchesSearch && matchesTags;
    });
  }, [comics, searchTerm, selectedTags]);

  const groupedComics = useMemo(() => {
    const groups: ComicGroup[] = [];
    const groupMap = new Map<string, Comic[]>();

    filteredComics.forEach(comic => {
      let groupKey = '';
      switch (groupBy) {
        case 'series':
          groupKey = comic.series;
          break;
        case 'publisher':
          groupKey = comic.publisher;
          break;
        case 'year':
          groupKey = new Date(comic.publicationDate).getFullYear().toString();
          break;
        default:
          groupKey = 'All Comics';
      }

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, []);
      }
      groupMap.get(groupKey)!.push(comic);
    });

    groupMap.forEach((comics, title) => {
      groups.push({
        title,
        comics: comics.sort((a, b) => a.issueNumber - b.issueNumber)
      });
    });

    return groups.sort((a, b) => a.title.localeCompare(b.title));
  }, [filteredComics, groupBy]);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search comics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="series">Group by Series</option>
              <option value="publisher">Group by Publisher</option>
              <option value="year">Group by Year</option>
              <option value="none">No Grouping</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTags(prev => 
                  prev.includes(tag) 
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                )}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {groupedComics.map(group => (
          <div key={group.title} className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" />
                {group.title}
                <span className="text-sm text-gray-500">
                  ({group.comics.length} {group.comics.length === 1 ? 'issue' : 'issues'})
                </span>
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
              {group.comics.map(comic => (
                <div
                  key={comic.id}
                  className="relative group cursor-pointer"
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden">
                    <img
                      src={comic.coverImage}
                      alt={`${comic.series} #${comic.issueNumber}`}
                      className="w-full h-full object-cover transform transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="text-white">
                      <p className="font-semibold truncate">
                        {comic.series} #{comic.issueNumber}
                      </p>
                      <p className="text-sm opacity-75">{comic.publisher}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}