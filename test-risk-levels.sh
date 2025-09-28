#!/bin/bash

# Test script to validate the three AI models with different risk levels
API_URL="http://localhost:9002/api/analyze"

echo "=== Testing Three AI Model Risk Levels ==="
echo ""

# Test models array with descriptions
declare -A models
models["low-risk-clean-model-12345"]="Low-Risk Clean Model"
models["medium-risk-suspicious-67890"]="Medium-Risk Suspicious Model" 
models["high-risk-dangerous-99999"]="High-Risk Dangerous Model"

echo "Testing 3 AI models with different risk profiles:"
echo ""

for file_id in "${!models[@]}"; do
    model_name="${models[$file_id]}"
    echo "🔍 Testing: $model_name"
    echo "File ID: $file_id"
    echo "----------------------------------------"
    
    # Make API call
    response=$(curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d "{\"fileId\": \"$file_id\"}")
    
    # Extract analysis results
    success=$(echo $response | grep -o '"success":[^,]*' | cut -d':' -f2)
    
    if [[ "$success" == "true" ]]; then
        # Extract key metrics
        risk_score=$(echo $response | grep -o '"riskScore":[0-9]*' | cut -d':' -f2)
        malware_status=$(echo $response | grep -o '"status":"[^"]*"' | head -1 | cut -d':' -f2 | tr -d '"')
        threats_found=$(echo $response | grep -o '"threatsFound":[0-9]*' | cut -d':' -f2)
        severity_level=$(echo $response | grep -o '"severityLevel":"[^"]*"' | cut -d':' -f2 | tr -d '"')
        model_type=$(echo $response | grep -o '"modelType":"[^"]*"' | cut -d':' -f2 | tr -d '"')
        author=$(echo $response | grep -o '"author":"[^"]*"' | cut -d':' -f2 | tr -d '"' | head -1)
        
        echo "  ✅ Analysis Results:"
        echo "     Risk Score: $risk_score/100"
        echo "     Malware Status: $malware_status"
        echo "     Threats Found: $threats_found"
        echo "     Severity Level: $severity_level"
        echo "     Model Type: $model_type"
        echo "     Author: ${author:-'Unknown'}"
        
        # Determine and display risk level with appropriate emoji
        if [ $risk_score -ge 70 ]; then
            echo "     🚨 Risk Level: CRITICAL - DO NOT USE"
        elif [ $risk_score -ge 50 ]; then
            echo "     🔴 Risk Level: HIGH - Use with extreme caution"
        elif [ $risk_score -ge 30 ]; then
            echo "     🟡 Risk Level: MEDIUM - Additional validation needed"
        elif [ $risk_score -ge 15 ]; then
            echo "     🟢 Risk Level: LOW - Follow standard practices"
        else
            echo "     ✅ Risk Level: MINIMAL - Safe for production"
        fi
        
        echo ""
        
        # Extract and display some threat details
        echo "  🔍 Threat Analysis:"
        if [ "$threats_found" -gt 0 ]; then
            # Try to extract threat details (simplified parsing)
            threat_details=$(echo $response | grep -o '"details":\[[^]]*\]' | head -1)
            if [[ -n "$threat_details" ]]; then
                echo "     Detected threats in model content"
            fi
        else
            echo "     No threats detected"
        fi
        
    else
        echo "  ❌ Analysis failed"
        error=$(echo $response | grep -o '"error":"[^"]*"' | cut -d':' -f2 | tr -d '"')
        echo "     Error: ${error:-'Unknown error'}"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
done

echo "=== Risk Level Validation Summary ==="
echo ""
echo "Expected Results:"
echo "🟢 Low-Risk Model:    Score 0-29   (Minimal/Low Risk)"
echo "🟡 Medium-Risk Model: Score 30-49  (Medium Risk)"  
echo "🔴 High-Risk Model:   Score 50+    (High/Critical Risk)"
echo ""
echo "The dynamic scoring system should correctly identify:"
echo "✓ Clean models with good metadata as low risk"
echo "✓ Models with suspicious patterns as medium risk"
echo "✓ Models with dangerous content as high/critical risk"
echo ""
echo "This demonstrates the improved accuracy over the previous"
echo "hardcoded scoring system that showed unrealistic results."