import React from 'react';
import { X } from 'lucide-react';
import { BatchUpload } from './BatchUpload';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Upload Comics</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <BatchUpload />
          
          <div className="mt-6 text-sm text-gray-500">
            <h3 className="font-medium mb-2">Tips:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Name your files with format: "Series-#IssueNumber"</li>
              <li>Supported formats: JPG, PNG</li>
              <li>You can upload multiple files at once</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}