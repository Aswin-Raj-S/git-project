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
      
      // Step 3: Save report to database and get report code
      setProgress(90);
      const saveResponse = await fetch('/api/reports/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisResult: analyzeResult.analysis
        }),
      });
      
      const saveResult = await saveResponse.json();
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save report');
      }
      
      // Store results with report code and navigate to report
      setAnalysisResult({
        ...analyzeResult.analysis,
        reportCode: saveResult.reportCode // Add report code to analysis result
      });
      setIsAnalyzing(false); // Clear analyzing state immediately
      setProgress(100);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${file.name}. Report code: ${saveResult.reportCode}`,
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
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileUp className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">{file.name}</p>
              <p className="text-sm text-slate-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • Model File
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleButtonClick}
              disabled={!file}
              className="flex-1 gap-3 h-14 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Security Analysis
            </Button>
            <Button
              onClick={() => setFile(null)}
              variant="outline"
              className="px-6 h-14 rounded-xl border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
            >
              Remove
            </Button>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="space-y-6 p-8 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 rounded-2xl border border-blue-200/40 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">
                  {progress < 25 ? "Uploading model..." : 
                   progress < 65 ? "Scanning for threats..." : 
                   progress < 90 ? "Analyzing architecture..." : 
                   "Finalizing report..."}
                </span>
                <span className="text-lg font-bold text-primary tabular-nums">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-white/60" />
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              </div>
              <span className="text-sm font-medium text-slate-700">Securing your AI model</span>
            </div>
            <p className="text-sm text-slate-600">
              🔍 Running comprehensive security analysis - This may take a moment
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
