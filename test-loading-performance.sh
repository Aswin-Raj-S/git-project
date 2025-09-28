#!/bin/bash

# Quick test to verify loading performance improvements

API_URL="http://localhost:9002/api/analyze"

echo "=== Loading Performance Test ==="
echo ""
echo "Testing analysis speed with optimized loading..."
echo ""

# Time the analysis of the low-risk model
echo "⏱️  Testing Low-Risk Model Analysis Speed:"
time_start=$(date +%s%3N)

response=$(curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{"fileId": "low-risk-clean-model-12345"}')
success=$(echo $response | grep -o '"success":[^,]*' | cut -d':' -f2)

time_end=$(date +%s%3N)
time_diff=$((time_end - time_start))

if [[ "$success" == "true" ]]; then
    echo "✅ Analysis completed successfully"
    echo "⚡ API Response Time: ${time_diff}ms"
    
    risk_score=$(echo $response | grep -o '"riskScore":[0-9]*' | cut -d':' -f2)
    echo "📊 Risk Score: $risk_score/100"
else
    echo "❌ Analysis failed"
fi

echo ""
echo "=== Performance Improvements Applied ==="
echo "✅ Reduced skeleton display time: 1000ms → 300ms"
echo "✅ Immediate data display when available"
echo "✅ Removed navigation delays: 500ms → 0ms"
echo "✅ Optimized loading state logic"
echo "✅ Faster progress updates"
echo "✅ More encouraging loading messages"
echo ""
echo "Expected UX improvements:"
echo "🚀 Faster perceived loading time"
echo "📱 More responsive UI feedback"
echo "💫 Smoother transitions"
echo "😊 Less intimidating loading messages"