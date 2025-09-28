/**
 * Advanced risk scoring system for AI model security analysis
 * Calculates dynamic scores based on actual threat analysis
 */

export interface ThreatAnalysis {
  malwareScan: {
    status: 'clean' | 'infected' | 'suspicious';
    threatsFound: number;
    details: string[];
    severityLevel: 'low' | 'medium' | 'high' | 'critical';
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
    author?: string;
    version?: string;
    modelSize: string;
  };
  riskScore: number;
}

export interface TrustScores {
  fileIntegrity: number;
  modelProvenance: number;
  securityProfile: number;
  communityTrust: number;
  overall: number;
}

export interface TrustIndicator {
  category: string;
  score: number;
  status: 'high' | 'medium' | 'low' | 'critical';
  details: string[];
  riskFactors: string[];
}

/**
 * Calculate file integrity score based on format and malware scan results
 */
export function calculateFileIntegrityScore(analysis: ThreatAnalysis): { score: number; details: string[]; riskFactors: string[] } {
  let score = 100;
  const details: string[] = [];
  const riskFactors: string[] = [];

  // Format safety assessment
  if (analysis.metadata.format === 'safetensors') {
    details.push('SafeTensors format verified - secure serialization');
    score = Math.max(score - 5, score); // Bonus for safe format
  } else if (analysis.metadata.format === 'pickle' || analysis.architecture.modelType.includes('Pickle')) {
    details.push('Pickle format detected - high deserialization risk');
    riskFactors.push('Unsafe serialization format');
    score -= 40;
  } else if (analysis.architecture.modelType.includes('PyTorch') && !analysis.metadata.format.includes('safetensors')) {
    details.push('PyTorch format - potential code execution risk');
    riskFactors.push('Potentially unsafe model format');
    score -= 25;
  }

  // CRITICAL: Use threat count and main risk score as primary factors
  if (analysis.malwareScan.threatsFound > 10) {
    details.push(`${analysis.malwareScan.threatsFound} threats detected - EXTREMELY DANGEROUS`);
    riskFactors.push('Massive threat count - critical security breach');
    score = Math.max(1, Math.min(score, 3)); // Cap at 1-3% for extremely dangerous
  } else if (analysis.malwareScan.threatsFound > 5) {
    details.push(`${analysis.malwareScan.threatsFound} threats detected - HIGH RISK`);
    riskFactors.push('High threat count detected');
    score = Math.min(score, 15);
  } else if (analysis.malwareScan.threatsFound > 0) {
    details.push(`${analysis.malwareScan.threatsFound} threats detected`);
    riskFactors.push('Security threats present');
    score -= Math.min(analysis.malwareScan.threatsFound * 20, 70);
  }

  // Malware scan impact
  switch (analysis.malwareScan.status) {
    case 'clean':
      if (analysis.malwareScan.threatsFound === 0) {
        details.push('No malicious patterns detected');
      }
      break;
    case 'suspicious':
      riskFactors.push('Suspicious content detected');
      score -= 40;
      break;
    case 'infected':
      riskFactors.push('Malicious content confirmed');
      score = Math.min(score, 10); // Cap at very low score for infected files
      break;
  }

  // Severity level impact
  switch (analysis.malwareScan.severityLevel) {
    case 'critical':
      riskFactors.push('Critical security threats present');
      score = Math.max(1, Math.min(score, 5)); // Cap at 1-5% for critical
      break;
    case 'high':
      riskFactors.push('High-risk security issues');
      score = Math.min(score, 20);
      break;
    case 'medium':
      riskFactors.push('Medium-risk security concerns');
      score -= 25;
      break;
  }

  // File size consistency check
  const modelSize = analysis.metadata.modelSize;
  if (modelSize.includes('GB') && parseFloat(modelSize) > 50) {
    details.push('Large model file - verify legitimacy');
    riskFactors.push('Unusually large file size');
    score -= 10;
  } else if (modelSize.includes('KB') && parseFloat(modelSize) < 100) {
    details.push('Suspiciously small model file');
    riskFactors.push('Incomplete or decoy model');
    score -= 20;
  } else {
    details.push('File size within expected parameters');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    details,
    riskFactors
  };
}

/**
 * Calculate model provenance score based on metadata and author information
 */
export function calculateModelProvenanceScore(analysis: ThreatAnalysis): { score: number; details: string[]; riskFactors: string[] } {
  let score = 50; // Start with neutral score
  const details: string[] = [];
  const riskFactors: string[] = [];

  // Author information
  if (analysis.metadata.author) {
    details.push(`Model author: ${analysis.metadata.author}`);
    score += 25;
  } else {
    details.push('No author information found');
    riskFactors.push('Unknown model origin');
    score -= 15;
  }

  // Version information
  if (analysis.metadata.version) {
    details.push(`Version: ${analysis.metadata.version}`);
    score += 15;
  } else {
    details.push('No version information available');
    riskFactors.push('Missing version control data');
    score -= 10;
  }

  // Framework information
  if (analysis.metadata.framework) {
    details.push(`Framework: ${analysis.metadata.framework}`);
    score += 10;
  } else {
    details.push('Framework information unavailable');
    riskFactors.push('Unknown training framework');
    score -= 5;
  }

  // Model type verification
  if (analysis.architecture.modelType !== 'Unknown') {
    details.push(`Model architecture: ${analysis.architecture.modelType}`);
    score += 10;
  } else {
    details.push('Unable to determine model architecture');
    riskFactors.push('Unidentified model structure');
    score -= 15;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    details,
    riskFactors
  };
}

/**
 * Calculate security profile score based on architecture analysis
 */
export function calculateSecurityProfileScore(analysis: ThreatAnalysis): { score: number; details: string[]; riskFactors: string[] } {
  let score = 85; // Start optimistic
  const details: string[] = [];
  const riskFactors: string[] = [];

  // CRITICAL: Use the main risk score as primary factor
  if (analysis.riskScore >= 90) {
    details.push('Critical risk score detected - severe security threats');
    riskFactors.push('Extremely dangerous model - critical security threats');
    score = Math.max(1, Math.min(score, 5)); // Cap at 1-5% for critical risk
  } else if (analysis.riskScore >= 70) {
    details.push('High risk score - significant security concerns');
    riskFactors.push('High-risk model with security threats');
    score = Math.min(score, 25);
  } else if (analysis.riskScore >= 50) {
    details.push('Medium risk score - moderate security concerns');
    riskFactors.push('Medium-risk model');
    score = Math.min(score, 45);
  } else if (analysis.riskScore >= 30) {
    details.push('Elevated risk score detected');
    score = Math.min(score, 65);
  }

  // Architecture suspicion
  if (analysis.architecture.suspicious) {
    details.push('Suspicious model architecture detected');
    riskFactors.push('Potentially malicious model structure');
    score -= 30;
  } else if (analysis.riskScore < 30) {
    details.push('Standard model architecture verified');
  }

  // Security issues
  if (analysis.architecture.securityIssues.length > 0) {
    const issueCount = analysis.architecture.securityIssues.length;
    details.push(`${issueCount} security issue(s) identified`);
    riskFactors.push(...analysis.architecture.securityIssues.slice(0, 3)); // Top 3 issues
    score -= Math.min(issueCount * 12, 45);
  } else if (analysis.riskScore < 30) {
    details.push('No architectural security issues found');
  }

  // Parameter count analysis
  const params = analysis.architecture.parameters;
  if (params > 100_000_000_000) { // > 100B parameters
    details.push(`Very large model (${(params / 1_000_000_000).toFixed(1)}B parameters)`);
    riskFactors.push('Extremely large model - resource risks');
    score -= 15;
  } else if (params > 10_000_000_000) { // > 10B parameters
    details.push(`Large model (${(params / 1_000_000_000).toFixed(1)}B parameters)`);
    score -= 5;
  } else if (params > 0) {
    details.push(`Model parameters: ${(params / 1_000_000).toFixed(1)}M`);
  }

  // Layer analysis
  if (analysis.architecture.layers.length > 0) {
    details.push(`${analysis.architecture.layers.length} layers analyzed`);
    // Check for unusual layer patterns
    const layerTypes = new Set(analysis.architecture.layers);
    if (layerTypes.size < analysis.architecture.layers.length / 3) {
      details.push('Repetitive layer structure - potentially optimized');
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    details,
    riskFactors
  };
}

/**
 * Calculate community trust score based on available information
 */
export function calculateCommunityTrustScore(analysis: ThreatAnalysis): { score: number; details: string[]; riskFactors: string[] } {
  let score = 25; // Start low since we have limited community data
  const details: string[] = [];
  const riskFactors: string[] = [];

  // This is where you would integrate with external APIs for community data
  // For now, we'll use basic heuristics

  // Known safe formats get higher community trust
  if (analysis.metadata.format === 'safetensors') {
    details.push('Using community-preferred SafeTensors format');
    score += 20;
  }

  // Popular frameworks suggest better community support
  if (analysis.metadata.framework?.toLowerCase().includes('huggingface')) {
    details.push('Hugging Face ecosystem - good community support');
    score += 25;
  } else if (analysis.metadata.framework?.toLowerCase().includes('pytorch')) {
    details.push('PyTorch framework - large community');
    score += 15;
  } else if (analysis.metadata.framework?.toLowerCase().includes('tensorflow')) {
    details.push('TensorFlow framework - enterprise support');
    score += 15;
  }

  // Standard model types have better community trust
  if (analysis.architecture.modelType.includes('Transformer') || 
      analysis.architecture.modelType.includes('CNN') ||
      analysis.architecture.modelType.includes('Neural Network')) {
    details.push('Standard architecture type - well understood');
    score += 15;
  }

  // Unknown or suspicious elements reduce trust
  if (analysis.architecture.suspicious) {
    details.push('Suspicious architecture reduces community confidence');
    riskFactors.push('Non-standard model behavior');
    score -= 25;
  }

  if (!analysis.metadata.author) {
    details.push('Anonymous model - limited community verification');
    riskFactors.push('No author accountability');
    score -= 10;
  }

  // Add placeholder for future community features
  details.push('Community verification features coming soon');
  riskFactors.push('Limited community validation data');

  return {
    score: Math.max(0, Math.min(100, score)),
    details,
    riskFactors
  };
}

/**
 * Calculate comprehensive trust scores from analysis data
 */
export function calculateTrustScores(analysis: ThreatAnalysis): { indicators: TrustIndicator[]; overall: number } {
  const fileIntegrity = calculateFileIntegrityScore(analysis);
  const modelProvenance = calculateModelProvenanceScore(analysis);
  const securityProfile = calculateSecurityProfileScore(analysis);
  const communityTrust = calculateCommunityTrustScore(analysis);

  // Helper function to determine status from score
  const getStatus = (score: number): 'high' | 'medium' | 'low' | 'critical' => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'low';
    return 'critical';
  };

  const indicators: TrustIndicator[] = [
    {
      category: 'File Integrity',
      score: fileIntegrity.score,
      status: getStatus(fileIntegrity.score),
      details: fileIntegrity.details,
      riskFactors: fileIntegrity.riskFactors
    },
    {
      category: 'Model Provenance',
      score: modelProvenance.score,
      status: getStatus(modelProvenance.score),
      details: modelProvenance.details,
      riskFactors: modelProvenance.riskFactors
    },
    {
      category: 'Security Profile',
      score: securityProfile.score,
      status: getStatus(securityProfile.score),
      details: securityProfile.details,
      riskFactors: securityProfile.riskFactors
    },
    {
      category: 'Community Trust',
      score: communityTrust.score,
      status: getStatus(communityTrust.score),
      details: communityTrust.details,
      riskFactors: communityTrust.riskFactors
    }
  ];

  // Calculate weighted overall score
  // File integrity and security profile are most important
  // For critical risk scenarios, use minimum of the critical components
  let overall;
  
  if (analysis.riskScore >= 90 || analysis.malwareScan.threatsFound > 10 || analysis.malwareScan.severityLevel === 'critical') {
    // For critical risk files, use the lowest score among critical components, minimum 1%
    overall = Math.max(1, Math.min(fileIntegrity.score, securityProfile.score));
  } else if (analysis.riskScore >= 70 || analysis.malwareScan.threatsFound > 5 || analysis.malwareScan.severityLevel === 'high') {
    // For high risk files, heavily weight the security components
    overall = Math.round(
      (fileIntegrity.score * 0.45) +
      (securityProfile.score * 0.45) +
      (modelProvenance.score * 0.10)
    );
  } else {
    // Standard weighted calculation for lower risk files
    overall = Math.round(
      (fileIntegrity.score * 0.35) +
      (securityProfile.score * 0.35) +
      (modelProvenance.score * 0.20) +
      (communityTrust.score * 0.10)
    );
  }

  return { indicators, overall };
}

/**
 * Get risk level description based on score
 */
export function getRiskLevel(score: number): { level: string; color: string; bgColor: string; progressColor: string; description: string } {
  if (score >= 80) {
    return {
      level: 'Low Risk',
      color: 'text-green-800',
      bgColor: 'bg-green-50',
      progressColor: 'bg-green-500',
      description: 'Model appears safe for use with standard precautions'
    };
  }
  if (score >= 60) {
    return {
      level: 'Medium Risk',
      color: 'text-yellow-800',
      bgColor: 'bg-yellow-50',
      progressColor: 'bg-yellow-500',
      description: 'Exercise caution and additional verification recommended'
    };
  }
  if (score >= 40) {
    return {
      level: 'High Risk',
      color: 'text-orange-800',
      bgColor: 'bg-orange-50',
      progressColor: 'bg-orange-500',
      description: 'Significant security concerns - use only with proper isolation'
    };
  }
  return {
    level: 'Critical Risk',
    color: 'text-red-800',
    bgColor: 'bg-red-50',
    progressColor: 'bg-red-500',
    description: 'Severe security threats detected - avoid using this model'
  };
}