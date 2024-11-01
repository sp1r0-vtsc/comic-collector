export interface Comic {
  id: string;
  series: string;
  issueNumber: number;
  publicationDate: string;
  publisher: string;
  creators: {
    writers: string[];
    artists: string[];
    coverArtists: string[];
  };
  coverPrice: number;
  condition: string;
  coverImage: string;
  notes?: string;
  customTags?: string[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  comicIds: string[];
  customAttributes?: Record<string, string>;
}

export type SortField = 'series' | 'issueNumber' | 'publicationDate' | 'publisher' | 'condition';
export type ViewMode = 'grid' | 'list';
export type GroupBy = 'series' | 'publisher' | 'year' | 'none';