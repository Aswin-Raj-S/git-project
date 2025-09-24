'use client';

import { useState, type DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileUp, Loader2, UploadCloud } from 'lucide-react';

interface UploadFormProps {
  onAnalyze: () => void;
  loading: boolean;
  progress: number;
}

export function UploadForm({ onAnalyze, loading, progress }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      // Basic validation for .pth or .zip
      if (selectedFile.name.endsWith('.pth') || selectedFile.name.endsWith('.zip')) {
        setFile(selectedFile);
      } else {
        alert('Please upload a .pth or .zip file.');
      }
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleButtonClick = () => {
    if (file) {
      onAnalyze();
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'relative w-full p-6 border-2 border-dashed rounded-lg text-center transition-colors duration-200',
          isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Drag & drop your model file here (.pth or .zip)
        </p>
        <p className="text-xs text-muted-foreground">or</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => document.getElementById('file-upload')?.click()}>
          Select File
        </Button>
        <input
          id="file-upload"
          type="file"
          accept=".pth,.zip"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
      </div>

      {file && !loading && (
        <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
          <div className="flex items-center gap-3">
            <FileUp className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
          <Button onClick={handleButtonClick} disabled={!file}>
            Analyze Model
          </Button>
        </div>
      )}
      
      {loading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Analyzing model...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 [&>div]:bg-accent" />
          <p className="text-xs text-muted-foreground text-center animate-pulse">
            This may take a few moments. Please don't close the window.
          </p>
        </div>
      )}
    </div>
  );
}
