'use client';

import { useState, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileUp, Loader2, UploadCloud } from 'lucide-react';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useToast } from '@/hooks/use-toast';

interface UploadFormProps {
  // Remove the old props since we'll handle everything internally now
}

export function UploadForm({}: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const { setAnalysisResult, setIsAnalyzing } = useAnalysis();
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      // Basic validation for .pth, .zip, or .safetensors
      if (selectedFile.name.endsWith('.pth') || selectedFile.name.endsWith('.zip') || selectedFile.name.endsWith('.safetensors')) {
        setFile(selectedFile);
      } else {
        alert('Please upload a .pth, .zip, or .safetensors file.');
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

  const handleButtonClick = async () => {
    if (!file) return;
    
    setLoading(true);
    setIsAnalyzing(true);
    setProgress(0);
    
    try {
      // Step 1: Upload file
      setProgress(20);
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }
      
      setProgress(50);
      
      // Step 2: Analyze file
      setProgress(60);
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId: uploadResult.fileId }),
      });
      
      setProgress(80);
      const analyzeResult = await analyzeResponse.json();
      
      if (!analyzeResult.success) {
        throw new Error(analyzeResult.error || 'Analysis failed');
      }
      
      setProgress(95);
      
      // Step 3: Store results and navigate to report
      setAnalysisResult(analyzeResult.analysis);
      setProgress(100);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${file.name}. Generating report...`,
      });
      
      setTimeout(() => {
        router.push('/report');
      }, 500);
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'An error occurred during analysis',
        variant: "destructive",
      });
      
      setLoading(false);
      setIsAnalyzing(false);
      setProgress(0);
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
          Drag & drop your model file here (.pth, .zip, or .safetensors)
        </p>
        <p className="text-xs text-muted-foreground">or</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => document.getElementById('file-upload')?.click()}>
          Select File
        </Button>
        <input
          id="file-upload"
          type="file"
          accept=".pth,.zip,.safetensors"
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
        <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="flex-1">
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>
                  {progress < 30 ? "Uploading model..." : 
                   progress < 60 ? "Scanning for threats..." : 
                   progress < 90 ? "Analyzing architecture..." : 
                   "Generating report..."}
                </span>
                <span className="tabular-nums">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground animate-pulse">
              🔍 Deep analysis in progress - This may take a few moments
            </p>
            <div className="flex justify-center items-center gap-1 text-xs text-muted-foreground">
              <span>Securing your AI model</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
