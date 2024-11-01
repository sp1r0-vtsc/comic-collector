import { Comic } from '../types/comic';

interface ExtractedMetadata {
  series: string;
  title: string;
  issueNumber: number;
  coverPrice: number;
  publicationDate: string;
  publisher: string;
}

const COMMON_PUBLISHERS = [
  'Marvel',
  'DC Comics',
  'Image Comics',
  'Dark Horse',
  'IDW',
  'Vertigo',
  'Boom! Studios'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ProcessingResult {
  success: boolean;
  data?: Partial<Comic>;
  error?: string;
  preview?: string;
}

export async function processComicImage(file: File): Promise<ProcessingResult> {
  try {
    // Validate file
    if (!ACCEPTED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, PNG, and WebP are supported.');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    // Create preview
    const preview = await createImagePreview(file);
    
    // Process image
    const optimizedImage = await optimizeImage(file);
    const metadata = extractMetadataFromFilename(file.name);
    
    return {
      success: true,
      preview,
      data: {
        ...metadata,
        coverImage: optimizedImage,
        condition: 'Near Mint',
        creators: {
          writers: [],
          artists: [],
          coverArtists: []
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

async function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate dimensions maintaining aspect ratio
        const maxSize = 200;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => reject(new Error('Failed to create preview'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

async function optimizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Max dimensions for full image
        const maxWidth = 1200;
        const maxHeight = 1800;
        
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Apply some sharpening
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Failed to process image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function extractMetadataFromFilename(filename: string): ExtractedMetadata {
  // Remove file extension and special characters
  const cleanName = filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  
  // Advanced regex pattern for comic book naming conventions
  const pattern = /^(?<series>.*?)(?:\s+|#)(?<issue>\d+)(?:\s+(?<title>.*?))?(?:\s+\((?<date>\d{4})\))?(?:\s+\$(?<price>\d+\.\d{2}|\d+))?$/i;
  
  const matches = cleanName.match(pattern);
  const groups = matches?.groups || {};

  // Detect publisher from series name
  const publisher = detectPublisher(groups.series || '');
  
  return {
    series: formatSeries(groups.series || 'Unknown Series'),
    title: groups.title || '',
    issueNumber: parseInt(groups.issue || '0', 10),
    coverPrice: parseFloat(groups.price || '0'),
    publicationDate: formatDate(groups.date),
    publisher
  };
}

function formatSeries(series: string): string {
  return series
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

function formatDate(year?: string): string {
  if (!year) return new Date().toISOString().split('T')[0];
  return `${year}-01-01`; // Default to January 1st if only year is provided
}

function detectPublisher(seriesName: string): string {
  const upperName = seriesName.toUpperCase();
  
  for (const publisher of COMMON_PUBLISHERS) {
    if (upperName.includes(publisher.toUpperCase())) {
      return publisher;
    }
  }
  
  return 'Unknown Publisher';
}