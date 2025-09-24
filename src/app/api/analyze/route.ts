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
  };
  architecture: {
    modelType: string;
    parameters: number;
    layers: string[];
    suspicious: boolean;
    securityIssues: string[];
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
    
    // Calculate risk score based on findings
    const riskScore = calculateRiskScore(malwareScanResult, architectureAnalysis);
    
    return {
      fileId,
      fileName,
      fileSize: fileStats.size,
      fileHash: hash,
      malwareScan: malwareScanResult,
      architecture: architectureAnalysis,
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
    Buffer.from('__import__'), // Dynamic imports
    Buffer.from('pickle.loads'), // Pickle loading (dangerous)
    Buffer.from('torch.load'), // PyTorch loading (can execute code)
    Buffer.from('joblib.load'), // Joblib loading
    Buffer.from('dill.load'), // Dill pickle loading
    Buffer.from('cloudpickle'), // Cloud pickle
    Buffer.from('<script'), // HTML script tags
    Buffer.from('javascript:'), // JavaScript URLs
    Buffer.from('vbscript:'), // VBScript URLs
    Buffer.from('data:text/html'), // Data URLs with HTML
    Buffer.from('powershell'), // PowerShell commands
    Buffer.from('cmd.exe'), // Windows command prompt
    Buffer.from('/bin/sh'), // Unix shell
    Buffer.from('/bin/bash'), // Bash shell
    Buffer.from('rm -rf'), // Destructive Unix commands
    Buffer.from('del /f'), // Destructive Windows commands
  ];
  
  const foundThreats: string[] = [];
  
  // Pattern scanning
  for (const pattern of suspiciousPatterns) {
    if (fileBuffer.includes(pattern)) {
      foundThreats.push(`Suspicious code pattern: ${pattern.toString()}`);
    }
  }
  
  // File size analysis
  if (fileBuffer.length > 10 * 1024 * 1024 * 1024) { // > 10GB
    foundThreats.push('Unusually large file size detected (potential resource exhaustion)');
  }
  
  if (fileBuffer.length < 1024) { // < 1KB
    foundThreats.push('Suspiciously small model file (potential decoy or incomplete)');
  }
  
  // Executable signature detection
  const executableSignatures = [
    { sig: Buffer.from([0x4D, 0x5A]), name: 'PE executable (Windows)' },
    { sig: Buffer.from([0x7F, 0x45, 0x4C, 0x46]), name: 'ELF executable (Linux)' },
    { sig: Buffer.from([0xCF, 0xFA, 0xED, 0xFE]), name: 'Mach-O executable (macOS)' },
    { sig: Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]), name: 'Java class file' },
    { sig: Buffer.from([0x50, 0x4B, 0x03, 0x04]), name: 'ZIP archive (check contents)' },
    { sig: Buffer.from([0x1F, 0x8B]), name: 'GZIP compressed file' },
  ];
  
  for (const { sig, name } of executableSignatures) {
    if (fileBuffer.subarray(0, sig.length).equals(sig)) {
      if (name.includes('executable')) {
        foundThreats.push(`Embedded executable detected: ${name}`);
      } else {
        foundThreats.push(`Archive/compressed content detected: ${name} - requires deeper inspection`);
      }
    }
  }
  
  // Entropy analysis (high entropy might indicate encryption/obfuscation)
  const entropy = calculateEntropy(fileBuffer.subarray(0, Math.min(fileBuffer.length, 10000)));
  if (entropy > 7.5) {
    foundThreats.push(`High entropy detected (${entropy.toFixed(2)}) - possible obfuscation or encryption`);
  }
  
  // URL/domain detection (potential C&C or data exfiltration)
  const urlPatterns = [
    /https?:\/\/[^\s]+/g,
    /ftp:\/\/[^\s]+/g,
    /[a-zA-Z0-9.-]+\.(com|net|org|ru|cn|tk|ml|ga|cf|xyz|top|click|download|zip|exe|bat|scr|pif|cmd|jar|vbs|js|jar|deb|rpm)/gi
  ];
  
  const fileStr = fileBuffer.toString('utf-8', 0, Math.min(fileBuffer.length, 50000)); // Check first 50KB
  for (const pattern of urlPatterns) {
    const matches = fileStr.match(pattern);
    if (matches && matches.length > 0) {
      foundThreats.push(`Suspicious URLs/domains found: ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}`);
      break;
    }
  }
  
  // Determine threat level
  let status: 'clean' | 'infected' | 'suspicious';
  if (foundThreats.length >= 3 || 
      foundThreats.some(threat => threat.includes('executable') || threat.includes('system') || threat.includes('eval'))) {
    status = 'infected';
  } else if (foundThreats.length > 0) {
    status = 'suspicious';
  } else {
    status = 'clean';
  }
  
  return {
    status,
    threatsFound: foundThreats.length,
    scanTime: new Date().toLocaleString(),
    details: foundThreats
  };
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

async function analyzeArchitecture(fileBuffer: Buffer, fileName: string) {
  let modelType = 'Unknown';
  let parameters = 0;
  const layers: string[] = [];
  let suspicious = false;
  const securityIssues: string[] = [];
  
  // Determine model type based on file extension and content
  if (fileName.endsWith('.safetensors')) {
    modelType = 'SafeTensors Format';
    
    // SafeTensors analysis - safer format, but still check for issues
    try {
      const headerLength = fileBuffer.readBigUInt64LE(0);
      if (headerLength > 0 && headerLength < fileBuffer.length && headerLength < 1024 * 1024) { // Header shouldn't be > 1MB
        const headerJson = fileBuffer.subarray(8, Number(headerLength) + 8).toString('utf8');
        const header = JSON.parse(headerJson);
        
        // Analyze tensor metadata
        for (const [key, value] of Object.entries(header)) {
          if (key !== '__metadata__' && typeof value === 'object') {
            layers.push(key);
            
            // Calculate parameters from tensor shapes
            if ((value as any).shape && Array.isArray((value as any).shape)) {
              const shape = (value as any).shape;
              const tensorParams = shape.reduce((a: number, b: number) => a * b, 1);
              parameters += tensorParams;
              
              // Check for suspicious tensor shapes
              if (tensorParams > 1000000000) { // > 1B parameters in single tensor
                securityIssues.push(`Extremely large tensor detected: ${key} (${tensorParams.toLocaleString()} parameters)`);
                suspicious = true;
              }
            }
            
            // Check data types
            if ((value as any).dtype) {
              const dtype = (value as any).dtype;
              if (!['F32', 'F16', 'BF16', 'I32', 'I16', 'I8', 'U8'].includes(dtype)) {
                securityIssues.push(`Unusual data type detected: ${dtype} in ${key}`);
                suspicious = true;
              }
            }
          }
        }
        
        // Check metadata for suspicious entries
        if (header.__metadata__) {
          const metadata = header.__metadata__;
          for (const [key, value] of Object.entries(metadata)) {
            if (typeof value === 'string') {
              // Check for suspicious metadata
              if (value.includes('http://') || value.includes('https://') || 
                  value.includes('exec') || value.includes('eval') ||
                  value.includes('__import__') || value.includes('subprocess')) {
                securityIssues.push(`Suspicious metadata found: ${key} = ${value}`);
                suspicious = true;
              }
            }
          }
        }
        
        // Check for suspicious layer names
        const suspiciousNames = [
          'backdoor', 'trojan', 'malware', 'exec', 'eval', 'system', 'shell',
          'cmd', 'powershell', 'wget', 'curl', 'download', 'upload', 'exfiltrate',
          'keylog', 'password', 'credential', 'token', 'secret', 'hidden'
        ];
        
        for (const layerName of layers) {
          const lowerName = layerName.toLowerCase();
          for (const suspName of suspiciousNames) {
            if (lowerName.includes(suspName)) {
              securityIssues.push(`Suspicious layer name: ${layerName}`);
              suspicious = true;
              break;
            }
          }
        }
        
      } else {
        securityIssues.push('Invalid SafeTensors header format detected');
        suspicious = true;
      }
    } catch (e) {
      securityIssues.push('Could not parse SafeTensors header - potential corruption or obfuscation');
      suspicious = true;
    }
    
  } else if (fileName.endsWith('.pth')) {
    modelType = 'PyTorch Model (.pth)';
    // PyTorch models use pickle - inherently risky for arbitrary code execution
    suspicious = true;
    securityIssues.push('PyTorch .pth files use pickle serialization - can execute arbitrary code during loading');
    layers.push('PyTorch State Dict (Pickled - HIGH RISK)');
    
    // Additional pickle-specific checks
    if (fileBuffer.includes(Buffer.from('REDUCE'))) {
      securityIssues.push('Pickle REDUCE operation detected - can execute arbitrary functions');
    }
    if (fileBuffer.includes(Buffer.from('GLOBAL'))) {
      securityIssues.push('Pickle GLOBAL operation detected - can import and execute modules');
    }
    
  } else if (fileName.endsWith('.zip')) {
    modelType = 'Compressed Model Archive';
    layers.push('ZIP Archive - Contents Unknown');
    securityIssues.push('ZIP archives require extraction and individual file analysis');
    
  } else if (fileName.endsWith('.h5') || fileName.endsWith('.hdf5')) {
    modelType = 'HDF5/Keras Model';
    layers.push('HDF5 Format');
    
  } else if (fileName.endsWith('.onnx')) {
    modelType = 'ONNX Model';
    layers.push('ONNX Format');
    
  } else if (fileName.endsWith('.pb')) {
    modelType = 'TensorFlow Protobuf';
    layers.push('TensorFlow Graph Definition');
    
  } else {
    modelType = 'Unknown Model Format';
    securityIssues.push('Unrecognized model format - cannot perform thorough security analysis');
    suspicious = true;
  }
  
  // File size-based parameter estimation if not calculated
  if (parameters === 0) {
    // Rough estimation: assume 4 bytes per parameter (float32)
    parameters = Math.floor(fileBuffer.length / 4 * 0.8); // 80% of file size as parameters
  }
  
  // Security assessment based on model size
  if (parameters > 100000000000) { // > 100B parameters
    securityIssues.push(`Extremely large model (${(parameters/1000000000).toFixed(1)}B parameters) - potential resource exhaustion risk`);
  }
  
  return {
    modelType,
    parameters,
    layers,
    suspicious,
    securityIssues
  };
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