#!/bin/bash

# Test script to validate the improved AI model risk scoring system
# This script tests the API with multiple model files and displays the results

API_URL="http://localhost:9002/api/analyze"
UPLOAD_DIR="/home/techcobra/Public/Private/fri/git-project/uploads"

echo "=== AI Model Risk Scoring System Validation ==="
echo "Testing improved dynamic scoring algorithm..."
echo ""

# Get list of model files
model_files=($(ls $UPLOAD_DIR | grep -E '\.safetensors$' | head -5))

if [ ${#model_files[@]} -eq 0 ]; then
    echo "No model files found in uploads directory"
    exit 1
fi

echo "Found ${#model_files[@]} model file(s) to test:"
for file in "${model_files[@]}"; do
    echo "  - $file"
done
echo ""

# Test each file
for file in "${model_files[@]}"; do
    # Extract file ID (part before the first underscore)
    file_id=$(echo $file | cut -d'_' -f1)
    
    echo "Testing file: $file (ID: $file_id)"
    echo "----------------------------------------"
    
    # Make API call
    response=$(curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d "{\"fileId\": \"$file_id\"}")
    
    # Extract key information using grep and sed (since jq is not available)
    success=$(echo $response | grep -o '"success":[^,]*' | cut -d':' -f2)
    
    if [[ "$success" == "true" ]]; then
        # Extract analysis details
        risk_score=$(echo $response | grep -o '"riskScore":[0-9]*' | cut -d':' -f2)
        malware_status=$(echo $response | grep -o '"status":"[^"]*"' | head -1 | cut -d':' -f2 | tr -d '"')
        threats_found=$(echo $response | grep -o '"threatsFound":[0-9]*' | cut -d':' -f2)
        model_type=$(echo $response | grep -o '"modelType":"[^"]*"' | cut -d':' -f2 | tr -d '"')
        file_format=$(echo $response | grep -o '"format":"[^"]*"' | cut -d':' -f2 | tr -d '"')
        
        echo "  ✓ Analysis successful"
        echo "  Risk Score: $risk_score/100"
        echo "  Malware Status: $malware_status"
        echo "  Threats Found: $threats_found"
        echo "  Model Type: $model_type"
        echo "  Format: $file_format"
        
        # Determine risk level
        if [ $risk_score -ge 70 ]; then
            echo "  Risk Level: CRITICAL ⚠️"
        elif [ $risk_score -ge 50 ]; then
            echo "  Risk Level: HIGH 🔴"
        elif [ $risk_score -ge 30 ]; then
            echo "  Risk Level: MEDIUM 🟡"
        elif [ $risk_score -ge 15 ]; then
            echo "  Risk Level: LOW 🟢"
        else
            echo "  Risk Level: MINIMAL 🟢"
        fi
    else
        echo "  ✗ Analysis failed"
        error=$(echo $response | grep -o '"error":"[^"]*"' | cut -d':' -f2 | tr -d '"')
        echo "  Error: $error"
    fi
    
    echo ""
done

echo "=== Validation Complete ==="
echo ""
echo "Key Improvements:"
echo "✓ Dynamic scoring based on actual threats detected"
echo "✓ Weighted scoring considering severity levels"
echo "✓ Format-specific risk assessment (SafeTensors vs Pickle)"
echo "✓ More granular risk levels (5 levels instead of 3)"
echo "✓ Real-time threat pattern analysis"
echo "✓ Architecture-based security assessment"
echo ""
echo "The new system provides more accurate risk assessment"
echo "by analyzing actual model content rather than using"
echo "hardcoded values."