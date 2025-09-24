import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

interface AnalysisResult {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileHash: string;
  malwareScan: {
    status: 'clean' | 'infected' | 'suspicious';
    threatsFound: number;
    scanTime: string;
    details: string[];
    severityLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  };
  architecture: {
    modelType: string;
    parameters: number;
    layers: string[];
    suspicious: boolean;
    securityIssues: string[];
  };
  metadata: {
    format: string;
    framework: string;
    version?: string;
    author?: string;
    description?: string;
    trainingInfo?: {
      dataset?: string;
      epochs?: number;
      accuracy?: number;
    };
    dependencies?: string[];
    modelSize: string;
    compressionRatio?: number;
  };
  riskScore: number;
  timestamp: string;
}

async function analyzeModelFile(filePath: string, fileName: string, fileId: string): Promise<AnalysisResult> {
  try {
    // Read file for analysis
    const fileBuffer = await readFile(filePath);
    const fileStats = await stat(filePath);
    
    // Generate file hash for integrity checking
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Basic malware scanning (checking for suspicious patterns)
    const malwareScanResult = await performMalwareScan(fileBuffer, fileName);
    
    // Architecture analysis
    const architectureAnalysis = await analyzeArchitecture(fileBuffer, fileName);
    
    // Extract metadata information
    const metadata = await extractModelMetadata(fileBuffer, fileName, fileStats.size);
    
    // Calculate risk score based on findings
    const riskScore = calculateRiskScore(malwareScanResult, architectureAnalysis);
    
    return {
      fileId,
      fileName,
      fileSize: fileStats.size,
      fileHash: hash,
      malwareScan: malwareScanResult,
      architecture: architectureAnalysis,
      metadata,
      riskScore,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to analyze model file');
  }
}

async function performMalwareScan(fileBuffer: Buffer, fileName: string) {
  // Enhanced malware patterns for AI model security
  const suspiciousPatterns = [
    Buffer.from('eval('), // JavaScript eval
    Buffer.from('exec('), // Python exec
    Buffer.from('subprocess'), // Python subprocess
    Buffer.from('os.system'), // System calls
    Buffer.from('import pickle'), // Python pickle (dangerous deserialization)
    Buffer.from('torch.load'), // PyTorch loading (can execute arbitrary code)
    Buffer.from('dill.load'), // Dill loading
    Buffer.from('joblib.load'), // Joblib loading
    Buffer.from('__reduce__'), // Python pickle reduction
    Buffer.from('__setstate__'), // Python pickle state setting
    Buffer.from('http://'), // HTTP URLs
    Buffer.from('https://'), // HTTPS URLs
    Buffer.from('ftp://'), // FTP URLs
    Buffer.from('subprocess.call'), // Direct subprocess calls
    Buffer.from('os.popen'), // Shell command execution
    Buffer.from('shell=True'), // Shell execution parameter
    Buffer.from('MZ'), // PE executable header
    Buffer.from('ELF'), // Linux executable header
    Buffer.from('\x7fELF'), // ELF magic bytes
    Buffer.from('PK'), // ZIP file header (could contain executables)
    Buffer.from('#!/bin/'), // Shell script shebang
    Buffer.from('powershell'), // PowerShell execution
    Buffer.from('cmd.exe'), // Windows command execution
    Buffer.from('reverse_tcp'), // Metasploit payload
    Buffer.from('meterpreter') // Metasploit payload
  ];
  
  const foundThreats: string[] = [];
  
  // Check for suspicious patterns
  for (const pattern of suspiciousPatterns) {
    if (fileBuffer.includes(pattern)) {
      foundThreats.push(`Suspicious pattern detected: ${pattern.toString()}`);
    }
  }
  
  // Check file entropy for obfuscation
  const entropy = calculateEntropy(fileBuffer);
  if (entropy > 7.5) {
    foundThreats.push('High entropy detected - possible obfuscation or encryption');
  }
  
  // Check for unusual file sizes
  const fileSize = fileBuffer.length;
  if (fileSize > 10 * 1024 * 1024 * 1024) { // > 10GB
    foundThreats.push('Unusually large file size - potential resource exhaustion');
  } else if (fileSize < 1024) { // < 1KB
    foundThreats.push('Suspiciously small file size - possible decoy or incomplete model');
  }
  
  // Determine severity and status
  let status: 'clean' | 'infected' | 'suspicious';
  let severityLevel: 'low' | 'medium' | 'high' | 'critical';
  const recommendations: string[] = [];
  
  const criticalThreats = foundThreats.filter(threat => 
    threat.includes('executable') || threat.includes('eval') || threat.includes('exec') || 
    threat.includes('system') || threat.includes('subprocess') || threat.includes('meterpreter')
  );
  
  const highThreats = foundThreats.filter(threat =>
    threat.includes('pickle') || threat.includes('torch.load') || threat.includes('powershell') ||
    threat.includes('reverse_tcp') || threat.includes('obfuscation')
  );
  
  if (criticalThreats.length > 0) {
    status = 'infected';
    severityLevel = 'critical';
    recommendations.push('DO NOT LOAD this model - contains critical security threats');
    recommendations.push('Quarantine the file immediately');
    recommendations.push('Scan your system for potential compromise');
  } else if (highThreats.length > 0 || foundThreats.length >= 3) {
    status = 'infected';
    severityLevel = 'high';
    recommendations.push('Avoid loading this model without proper sandboxing');
    recommendations.push('Review the model source and training process');
    recommendations.push('Consider using a secure model loading environment');
  } else if (foundThreats.length > 0) {
    status = 'suspicious';
    severityLevel = foundThreats.length > 1 ? 'medium' : 'low';
    recommendations.push('Exercise caution when loading this model');
    recommendations.push('Verify the model source and integrity');
    recommendations.push('Monitor system behavior during model loading');
  } else {
    status = 'clean';
    severityLevel = 'low';
    recommendations.push('No immediate threats detected');
    recommendations.push('Continue with standard security practices');
  }
  
  return {
    status,
    threatsFound: foundThreats.length,
    scanTime: new Date().toLocaleString(),
    details: foundThreats,
    severityLevel,
    recommendations
  };
}

// Extract model metadata information
async function extractModelMetadata(fileBuffer: Buffer, fileName: string, fileSize: number) {
  const metadata = {
    format: 'Unknown',
    framework: 'Unknown',
    version: undefined as string | undefined,
    author: undefined as string | undefined,
    description: undefined as string | undefined,
    trainingInfo: undefined as { dataset?: string; epochs?: number; accuracy?: number } | undefined,
    dependencies: [] as string[],
    modelSize: formatFileSize(fileSize),
    compressionRatio: undefined as number | undefined
  };
  
  // Determine format and framework based on file extension
  if (fileName.endsWith('.safetensors')) {
    metadata.format = 'SafeTensors';
    metadata.framework = 'Multi-framework (Hugging Face)';
  } else if (fileName.endsWith('.pth') || fileName.endsWith('.pt')) {
    metadata.format = 'PyTorch';
    metadata.framework = 'PyTorch';
  } else if (fileName.endsWith('.h5')) {
    metadata.format = 'HDF5';
    metadata.framework = 'TensorFlow/Keras';
  } else if (fileName.endsWith('.pkl') || fileName.endsWith('.pickle')) {
    metadata.format = 'Pickle';
    metadata.framework = 'Python/Scikit-learn';
  } else if (fileName.endsWith('.onnx')) {
    metadata.format = 'ONNX';
    metadata.framework = 'ONNX Runtime';
  } else if (fileName.endsWith('.zip')) {
    metadata.format = 'Compressed Archive';
    metadata.framework = 'Various';
  }
  
  // Try to extract metadata from SafeTensors format
  if (fileName.endsWith('.safetensors')) {
    try {
      const headerSize = fileBuffer.readBigUInt64LE(0);
      if (headerSize < 1000000) { // Reasonable header size limit
        const headerBytes = fileBuffer.subarray(8, 8 + Number(headerSize));
        const headerText = headerBytes.toString('utf8');
        const headerData = JSON.parse(headerText);
        
        if (headerData.__metadata__) {
          const meta = headerData.__metadata__;
          metadata.author = meta.author || meta.creator;
          metadata.description = meta.description || meta.model_name;
          metadata.version = meta.version || meta.model_version;
          
          if (meta.training_info) {
            metadata.trainingInfo = {
              dataset: meta.training_info.dataset,
              epochs: meta.training_info.epochs,
              accuracy: meta.training_info.accuracy
            };
          }
        }
      }
    } catch (error) {
      // Metadata extraction failed, continue with basic info
    }
  }
  
  // Check for common framework dependencies in the file content
  const fileText = fileBuffer.toString('utf8', 0, Math.min(10000, fileBuffer.length));
  const dependencies = [];
  
  if (fileText.includes('torch') || fileText.includes('pytorch')) {
    dependencies.push('PyTorch');
  }
  if (fileText.includes('tensorflow') || fileText.includes('keras')) {
    dependencies.push('TensorFlow');
  }
  if (fileText.includes('numpy')) {
    dependencies.push('NumPy');
  }
  if (fileText.includes('transformers')) {
    dependencies.push('Hugging Face Transformers');
  }
  if (fileText.includes('sklearn')) {
    dependencies.push('Scikit-learn');
  }
  
  metadata.dependencies = dependencies;
  
  return metadata;
}

// Helper function to format file sizes
function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
// Enhanced AI model detection and analysis
async function analyzeArchitecture(fileBuffer: Buffer, fileName: string) {
  let modelType = 'Unknown';
  let parameters = 0;
  const layers: string[] = [];
  let suspicious = false;
  const securityIssues: string[] = [];
  
  // Advanced model type detection based on file signatures and content
  if (fileName.endsWith('.safetensors')) {
    const result = await analyzeSafeTensorsModel(fileBuffer);
    modelType = result.modelType;
    parameters = result.parameters;
    layers.push(...result.layers);
    securityIssues.push(...result.securityIssues);
    
  } else if (fileName.endsWith('.pth') || fileName.endsWith('.pt')) {
    const result = await analyzePyTorchModel(fileBuffer);
    modelType = result.modelType;
    parameters = result.parameters;
    layers.push(...result.layers);
    securityIssues.push(...result.securityIssues);
    suspicious = true; // PyTorch models can execute arbitrary code
    
  } else if (fileName.endsWith('.h5')) {
    const result = await analyzeKerasModel(fileBuffer);
    modelType = result.modelType;
    parameters = result.parameters;
    layers.push(...result.layers);
    securityIssues.push(...result.securityIssues);
    
  } else if (fileName.endsWith('.onnx')) {
    const result = await analyzeONNXModel(fileBuffer);
    modelType = result.modelType;
    parameters = result.parameters;
    layers.push(...result.layers);
    securityIssues.push(...result.securityIssues);
    
  } else if (fileName.endsWith('.pkl') || fileName.endsWith('.pickle')) {
    modelType = 'Pickle Serialized Model (HIGH RISK)';
    securityIssues.push('Pickle format can execute arbitrary code during deserialization');
    suspicious = true;
    
  } else if (fileName.endsWith('.zip')) {
    const result = await analyzeZipModel(fileBuffer, fileName);
    modelType = result.modelType;
    parameters = result.parameters;
    layers.push(...result.layers);
    securityIssues.push(...result.securityIssues);
    suspicious = result.suspicious;
  }
  
  // Advanced security analysis
  const advancedSecurityCheck = await performAdvancedSecurityAnalysis(fileBuffer, fileName);
  if (advancedSecurityCheck.issues.length > 0) {
    securityIssues.push(...advancedSecurityCheck.issues);
    suspicious = suspicious || advancedSecurityCheck.suspicious;
  }
  
  return {
    modelType,
    parameters,
    layers: layers.slice(0, 20), // Limit to first 20 layers
    suspicious,
    securityIssues
  };
}

// Enhanced SafeTensors analysis
async function analyzeSafeTensorsModel(fileBuffer: Buffer) {
  let modelType = 'SafeTensors Format';
  let parameters = 0;
  const layers: string[] = [];
  const securityIssues: string[] = [];
  
  try {
    const headerLength = fileBuffer.readBigUInt64LE(0);
    if (headerLength > 0 && headerLength < fileBuffer.length && headerLength < 1024 * 1024) {
      const headerJson = fileBuffer.subarray(8, Number(headerLength) + 8).toString('utf8');
      const metadata = JSON.parse(headerJson);
      
      // Analyze tensor information
      for (const [tensorName, tensorInfo] of Object.entries(metadata)) {
        if (typeof tensorInfo === 'object' && tensorInfo !== null && 'shape' in tensorInfo) {
          const info = tensorInfo as { shape: number[]; dtype: string };
          const tensorParams = info.shape.reduce((a, b) => a * b, 1);
          parameters += tensorParams;
          
          // Identify layer types from tensor names
          if (tensorName.includes('weight') || tensorName.includes('bias')) {
            if (tensorName.includes('conv')) {
              layers.push('Convolutional Layer');
            } else if (tensorName.includes('linear') || tensorName.includes('fc')) {
              layers.push('Linear/Dense Layer');
            } else if (tensorName.includes('norm')) {
              layers.push('Normalization Layer');
            } else if (tensorName.includes('embed')) {
              layers.push('Embedding Layer');
            } else if (tensorName.includes('attention')) {
              layers.push('Attention Layer');
            }
          }
        }
      }
      
      // Detect model architecture from layer patterns
      if (layers.some(l => l.includes('Attention'))) {
        modelType = 'Transformer-based Model (SafeTensors)';
      } else if (layers.some(l => l.includes('Convolutional'))) {
        modelType = 'CNN Model (SafeTensors)';
      } else if (layers.some(l => l.includes('Linear'))) {
        modelType = 'Neural Network Model (SafeTensors)';
      }
    }
  } catch (error) {
    securityIssues.push('Failed to parse SafeTensors header - potentially corrupted');
  }
  
  return { modelType, parameters, layers: [...new Set(layers)], securityIssues };
}

// PyTorch model analysis
async function analyzePyTorchModel(fileBuffer: Buffer) {
  let modelType = 'PyTorch Model (.pth/.pt)';
  let parameters = 0;
  const layers: string[] = [];
  const securityIssues: string[] = [];
  
  // PyTorch models are inherently risky due to pickle
  securityIssues.push('PyTorch models use pickle serialization (code execution risk)');
  
  // Try to detect common PyTorch patterns
  const fileStr = fileBuffer.toString('utf8', 0, Math.min(10000, fileBuffer.length));
  
  if (fileStr.includes('torch')) {
    if (fileStr.includes('torchvision')) {
      modelType = 'PyTorch Vision Model';
    } else if (fileStr.includes('transformers')) {
      modelType = 'PyTorch Transformer Model';
    }
  }
  
  // Estimate parameters from file size (rough approximation)
  parameters = Math.floor(fileBuffer.length / 4); // Assume float32
  
  return { modelType, parameters, layers, securityIssues };
}

// Keras/HDF5 model analysis
async function analyzeKerasModel(fileBuffer: Buffer) {
  let modelType = 'Keras/HDF5 Model';
  let parameters = 0;
  const layers: string[] = [];
  const securityIssues: string[] = [];
  
  // HDF5 signature check
  if (!fileBuffer.subarray(0, 8).equals(Buffer.from([0x89, 0x48, 0x44, 0x46, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    securityIssues.push('Invalid HDF5 file signature');
  }
  
  // Estimate parameters from file size
  parameters = Math.floor(fileBuffer.length / 4);
  
  return { modelType, parameters, layers, securityIssues };
}

// ONNX model analysis
async function analyzeONNXModel(fileBuffer: Buffer) {
  let modelType = 'ONNX Model';
  let parameters = 0;
  const layers: string[] = [];
  const securityIssues: string[] = [];
  
  // Basic ONNX validation
  const fileStr = fileBuffer.toString('utf8', 0, Math.min(1000, fileBuffer.length));
  if (fileStr.includes('onnx') || fileStr.includes('ONNX')) {
    modelType = 'ONNX Runtime Model';
  }
  
  parameters = Math.floor(fileBuffer.length / 4);
  
  return { modelType, parameters, layers, securityIssues };
}

// ZIP archive analysis (for compressed models)
async function analyzeZipModel(fileBuffer: Buffer, fileName: string) {
  let modelType = 'Compressed Model Archive';
  let parameters = 0;
  const layers: string[] = [];
  const securityIssues: string[] = [];
  let suspicious = false;
  
  // ZIP file signature check
  if (!fileBuffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4B, 0x03, 0x04]))) {
    securityIssues.push('Invalid ZIP file signature');
    suspicious = true;
  }
  
  // Check for suspicious files in archive (basic check)
  const zipContent = fileBuffer.toString('utf8');
  if (zipContent.includes('.exe') || zipContent.includes('.bat') || zipContent.includes('.sh')) {
    securityIssues.push('Archive contains executable files');
    suspicious = true;
  }
  
  parameters = Math.floor(fileBuffer.length / 4);
  
  return { modelType, parameters, layers, securityIssues, suspicious };
}

// Advanced security analysis
async function performAdvancedSecurityAnalysis(fileBuffer: Buffer, fileName: string) {
  const issues: string[] = [];
  let suspicious = false;
  
  // Check for embedded scripts or code
  const fileStr = fileBuffer.toString('utf8', 0, Math.min(50000, fileBuffer.length));
  
  // Check for various programming language patterns
  const codePatterns = [
    { pattern: /import\s+os/g, desc: 'Python OS imports detected' },
    { pattern: /import\s+subprocess/g, desc: 'Python subprocess imports detected' },
    { pattern: /eval\s*\(/g, desc: 'Dynamic code evaluation detected' },
    { pattern: /exec\s*\(/g, desc: 'Code execution patterns detected' },
    { pattern: /__import__/g, desc: 'Dynamic import patterns detected' },
    { pattern: /pickle\.loads/g, desc: 'Pickle deserialization detected' },
    { pattern: /torch\.load/g, desc: 'PyTorch loading with potential code execution' },
  ];
  
  for (const { pattern, desc } of codePatterns) {
    if (pattern.test(fileStr)) {
      issues.push(desc);
      suspicious = true;
    }
  }
  
  // Check for suspicious file size patterns
  if (fileBuffer.length > 50 * 1024 * 1024 * 1024) { // > 50GB
    issues.push('Extremely large file size - potential storage abuse');
    suspicious = true;
  }
  
  // Check entropy for obfuscation
  const entropy = calculateEntropy(fileBuffer.subarray(0, Math.min(100000, fileBuffer.length)));
  if (entropy > 7.8) {
    issues.push('Very high entropy detected - possible advanced obfuscation');
    suspicious = true;
  }
  
  return { issues, suspicious };
}

// Helper function to calculate entropy
function calculateEntropy(buffer: Buffer): number {
  const freq: Record<number, number> = {};
  
  // Count byte frequencies
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    freq[byte] = (freq[byte] || 0) + 1;
  }
  
  // Calculate entropy
  let entropy = 0;
  const length = buffer.length;
  
  for (const count of Object.values(freq)) {
    const probability = count / length;
    entropy -= probability * Math.log2(probability);
  }
  
  return entropy;
}

// Helper function to format file sizes
function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}
        export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json();
    
    if (!fileId) {
      return NextResponse.json({ success: false, error: 'No file ID provided' });
    }
    
    // Find the uploaded file
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // For now, find file by matching fileId prefix
    const fs = require('fs');
    const uploadedFiles = fs.readdirSync(uploadsDir).filter((f: string) => f.startsWith(fileId));
    
    if (uploadedFiles.length === 0) {
      return NextResponse.json({ success: false, error: 'File not found' });
    }
    
    const fileName = uploadedFiles[0];
    const filePath = path.join(uploadsDir, fileName);
    const originalName = fileName.replace(`${fileId}_`, '');
    
    // Perform analysis
    const analysisResult = await analyzeModelFile(filePath, originalName, fileId);
    
    return NextResponse.json({ 
      success: true, 
      analysis: analysisResult 
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to analyze file' 
    });
  }
}

function calculateRiskScore(malwareScan: any, architecture: any): number {
  let score = 0;
  
  // Malware scan contribution (0-60 points)
  if (malwareScan.status === 'infected') score += 60;
  else if (malwareScan.status === 'suspicious') score += 30;
  
  // Add points based on number of threats found
  score += Math.min(malwareScan.threatsFound * 5, 20);
  
  // Architecture contribution (0-35 points)
  if (architecture.suspicious) score += 20;
  if (architecture.modelType.includes('PyTorch')) score += 15; // Pickle risk
  if (architecture.securityIssues && architecture.securityIssues.length > 0) {
    score += Math.min(architecture.securityIssues.length * 5, 15);
  }
  
  // Model size contribution (0-15 points)
  if (architecture.parameters > 100000000000) score += 15; // > 100B parameters
  else if (architecture.parameters > 10000000000) score += 10; // > 10B parameters
  else if (architecture.parameters > 1000000000) score += 5; // > 1B parameters
  
  return Math.min(score, 100);
}

function calculateRiskScore(malwareScan: any, architecture: any): number {
  let score = 0;
  
  // Malware scan contribution (0-60 points)
  if (malwareScan.status === 'infected') score += 60;
  else if (malwareScan.status === 'suspicious') score += 30;
  
  // Add points based on number of threats found
  score += Math.min(malwareScan.threatsFound * 5, 20);
  
  // Architecture contribution (0-35 points)
  if (architecture.suspicious) score += 20;
  if (architecture.modelType.includes('PyTorch')) score += 15; // Pickle risk
  if (architecture.securityIssues && architecture.securityIssues.length > 0) {
    score += Math.min(architecture.securityIssues.length * 5, 15);
  }
  
  // Model size contribution (0-15 points)
  if (architecture.parameters > 100000000000) score += 15; // > 100B parameters
  else if (architecture.parameters > 10000000000) score += 10; // > 10B parameters
  else if (architecture.parameters > 1000000000) score += 5; // > 1B parameters
  
  return Math.min(score, 100);
}

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json();
    
    if (!fileId) {
      return NextResponse.json({ success: false, error: 'No file ID provided' });
    }
    
    // Find the uploaded file
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const files = await readFile(path.join(uploadsDir, '.')).catch(() => null);
    
    // For now, find file by matching fileId prefix
    const fs = require('fs');
    const uploadedFiles = fs.readdirSync(uploadsDir).filter((f: string) => f.startsWith(fileId));
    
    if (uploadedFiles.length === 0) {
      return NextResponse.json({ success: false, error: 'File not found' });
    }
    
    const fileName = uploadedFiles[0];
    const filePath = path.join(uploadsDir, fileName);
    const originalName = fileName.replace(`${fileId}_`, '');
    
    // Perform analysis
    const analysisResult = await analyzeModelFile(filePath, originalName, fileId);
    
    return NextResponse.json({ 
      success: true, 
      analysis: analysisResult 
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to analyze file' 
    });
  }
}