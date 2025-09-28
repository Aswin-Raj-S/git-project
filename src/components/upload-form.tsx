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
      
      setProgress(85);
      const analyzeResult = await analyzeResponse.json();
      
      if (!analyzeResult.success) {
        throw new Error(analyzeResult.error || 'Analysis failed');
      }
      
      setProgress(95);
      
      // Step 3: Store results and navigate to report
      setAnalysisResult(analyzeResult.analysis);
      setIsAnalyzing(false); // Clear analyzing state immediately
      setProgress(100);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${file.name}.`,
      });
      
      // Navigate immediately for faster UX
      router.push('/report');
      
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
          'border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group',
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg'
            : 'border-slate-300 hover:border-primary/60 hover:bg-primary/5 hover:shadow-md'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-6">
          <div className={cn(
            'mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300',
            isDragging ? 'bg-primary/20 scale-110' : 'bg-slate-100 group-hover:bg-primary/10 group-hover:scale-105'
          )}>
            <UploadCloud className={cn(
              'h-10 w-10 transition-colors duration-300',
              isDragging ? 'text-primary' : 'text-slate-400 group-hover:text-primary'
            )} />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-slate-700">
              Drag & drop your model file here
            </p>
            <p className="text-slate-500">
              Supports .pth, .zip, and .safetensors formats
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-sm text-slate-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>
          <Button
            onClick={() => document.getElementById('file-input')?.click()}
            className="gap-3 h-12 px-8 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <FileUp className="w-5 h-5" />
            Browse Files
          </Button>
          <input
            id="file-input"
            type="file"
            accept=".pth,.zip,.safetensors"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>
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
                  {progress < 25 ? "Uploading model..." : 
                   progress < 65 ? "Scanning for threats..." : 
                   progress < 90 ? "Analyzing architecture..." : 
                   "Almost ready..."}
                </span>
                <span className="tabular-nums">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground animate-pulse">
              🔍 Running security analysis - Just a moment!
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
