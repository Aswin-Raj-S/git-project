#!/bin/bash

# Debug script to show Model Trust & Provenance scores for all three models

API_URL="http://localhost:9002/api/analyze"

echo "=== Model Trust & Provenance Debug Test ==="
echo ""

# Test models
declare -A models
models["low-risk-clean-model-12345"]="Low-Risk Clean Model"
models["medium-risk-suspicious-67890"]="Medium-Risk Suspicious Model" 
models["high-risk-dangerous-99999"]="High-Risk Dangerous Model"

for file_id in "${!models[@]}"; do
    model_name="${models[$file_id]}"
    echo "🔍 Testing: $model_name"
    echo "----------------------------------------"
    
    # Get analysis data
    response=$(curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d "{\"fileId\": \"$file_id\"}")
    
    # Extract trust-relevant data
    risk_score=$(echo $response | grep -o '"riskScore":[0-9]*' | cut -d':' -f2)
    malware_status=$(echo $response | grep -o '"status":"[^"]*"' | head -1 | cut -d':' -f2 | tr -d '"')
    threats_found=$(echo $response | grep -o '"threatsFound":[0-9]*' | cut -d':' -f2)
    model_format=$(echo $response | grep -o '"format":"[^"]*"' | cut -d':' -f2 | tr -d '"')
    author=$(echo $response | grep -o '"author":"[^"]*"' | cut -d':' -f2 | tr -d '"')
    framework=$(echo $response | grep -o '"framework":"[^"]*"' | cut -d':' -f2 | tr -d '"')
    suspicious=$(echo $response | grep -o '"suspicious":[^,]*' | cut -d':' -f2)
    
    echo "Raw Analysis Data:"
    echo "  Risk Score: $risk_score/100"
    echo "  Format: $model_format"
    echo "  Author: ${author:-'Not specified'}"
    echo "  Framework: $framework"
    echo "  Malware Status: $malware_status"
    echo "  Threats: $threats_found"
    echo "  Suspicious Architecture: $suspicious"
    echo ""
    
    # Calculate expected trust scores manually based on our algorithm
    echo "Expected Trust Card Scores:"
    
    # File Integrity Score Calculation
    file_integrity=100
    if [[ "$model_format" == "safetensors" ]]; then
        echo "  📁 File Integrity: HIGH (SafeTensors format bonus)"
        file_integrity=$((file_integrity - 5)) # Bonus for safe format
    fi
    case $malware_status in
        "clean") file_integrity=$file_integrity ;;
        "suspicious") file_integrity=$((file_integrity - threats_found * 8)) ;;
        "infected") file_integrity=$((file_integrity - threats_found * 15)) ;;
    esac
    file_integrity=$(( file_integrity > 0 ? file_integrity : 0 ))
    echo "     Expected Score: $file_integrity/100"
    
    # Model Provenance Score
    provenance=50
    if [[ -n "$author" && "$author" != "Not specified" ]]; then
        provenance=$((provenance + 25))
        echo "  👤 Model Provenance: GOOD (Author: $author)"
    else
        provenance=$((provenance - 15))
        echo "  👤 Model Provenance: POOR (No author info)"
    fi
    provenance=$(( provenance > 0 ? provenance : 0 ))
    echo "     Expected Score: $provenance/100"
    
    # Security Profile Score
    security=85
    if [[ "$suspicious" == "true" ]]; then
        security=$((security - 30))
        echo "  🔒 Security Profile: POOR (Suspicious architecture)"
    else
        echo "  🔒 Security Profile: GOOD (Standard architecture)"
    fi
    security=$(( security > 0 ? security : 0 ))
    echo "     Expected Score: $security/100"
    
    # Community Trust Score
    community=25
    if [[ "$model_format" == "safetensors" ]]; then
        community=$((community + 20))
    fi
    if [[ "$framework" == *"Hugging Face"* ]]; then
        community=$((community + 25))
    fi
    community=$(( community > 0 ? community : 0 ))
    echo "  🌐 Community Trust: Expected Score: $community/100"
    
    # Overall Trust Score (weighted average)
    overall=$(( (file_integrity * 35 + security * 35 + provenance * 20 + community * 10) / 100 ))
    echo ""
    echo "📊 Overall Trust Score: $overall/100"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
done

echo "This shows what the Model Trust & Provenance card should display"
echo "based on the actual analysis data from each AI model."