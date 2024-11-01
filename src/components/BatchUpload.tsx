import React, { useCallback, useState, useRef } from 'react';
import { Upload, Loader, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useComicStore } from '../hooks/useComicStore';
import { processComicImage, ProcessingResult } from '../utils/imageProcessing';

interface ProcessingError {
  filename: string;
  error: string;
}

interface FilePreview {
  id: string;
  name: string;
  preview?: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

export function BatchUpload() {
  const { addComic } = useComicStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errors, setErrors] = useState<ProcessingError[]>([]);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (!imageFiles.length) {
      setErrors([{ filename: 'Upload', error: 'No valid image files found' }]);
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: imageFiles.length });
    setErrors([]);
    setPreviews(imageFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      status: 'pending'
    })));

    const newErrors: ProcessingError[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      setPreviews(prev => prev.map(p => 
        p.name === file.name ? { ...p, status: 'processing' } : p
      ));

      try {
        const result: ProcessingResult = await processComicImage(file);
        
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Processing failed');
        }

        addComic({
          ...result.data,
          id: crypto.randomUUID(),
        });

        setPreviews(prev => prev.map(p => 
          p.name === file.name ? { 
            ...p, 
            status: 'success',
            preview: result.preview 
          } : p
        ));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        newErrors.push({ filename: file.name, error: errorMessage });
        setPreviews(prev => prev.map(p => 
          p.name === file.name ? { 
            ...p, 
            status: 'error',
            error: errorMessage 
          } : p
        ));
      }

      setProgress(prev => ({ ...prev, current: i + 1 }));
    }

    setErrors(newErrors);
    setIsProcessing(false);
  }, [addComic]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    processFiles(files);
    event.target.value = '';
  }, [processFiles]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('bg-blue-50');
    }
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('bg-blue-50');
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('bg-blue-50');
    }
    const files = event.dataTransfer.files;
    if (files?.length) {
      processFiles(files);
    }
  }, [processFiles]);

  return (
    <div className="w-full space-y-4">
      <div 
        ref={dropZoneRef}
        className="relative transition-all duration-200"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          webkitdirectory="true"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
          accept="image/*"
        />
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">
                Processing {progress.current} of {progress.total} images...
              </p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-gray-600">
                Drop comic covers here or click to select
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: JPG, PNG, WebP (max 5MB)
              </p>
            </>
          )}
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {previews.map((file) => (
            <div
              key={file.id}
              className="relative bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
            >
              <div className="aspect-[2/3] bg-gray-100 flex items-center justify-center">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {file.status === 'processing' && (
                    <Loader className="w-3 h-3 text-blue-500 animate-spin" />
                  )}
                  <span className={`text-xs ${
                    file.status === 'success' ? 'text-green-600' :
                    file.status === 'error' ? 'text-red-600' :
                    file.status === 'processing' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {file.status === 'success' ? 'Processed' :
                     file.status === 'error' ? 'Failed' :
                     file.status === 'processing' ? 'Processing...' :
                     'Pending'}
                  </span>
                </div>
              </div>
              {file.error && (
                <div className="absolute top-0 right-0 left-0 bg-red-500 text-white text-xs p-1">
                  {file.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="font-medium text-red-800">Processing Errors</h3>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>
                {error.filename}: {error.error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}