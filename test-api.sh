#!/bin/bash

echo "🧪 GeoConquer API Test Script"
echo "=============================="
echo ""

API_URL="http://localhost:3000/api"

echo "1. Testing API root endpoint..."
curl -s http://localhost:3000 | jq '.'
echo ""

echo "2. Creating test user..."
USER_ID=$(curl -s -X POST $API_URL/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test_user","email":"test@geoconquer.it"}' | jq -r '.id')
echo "Created user with ID: $USER_ID"
echo ""

echo "3. Recording activity..."
curl -s -X POST $API_URL/territories/activity \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"route\":[{\"latitude\":45.4642,\"longitude\":9.1900},{\"latitude\":45.4652,\"longitude\":9.1910}],\"duration\":600}" | jq '.'
echo ""

echo "4. Getting user stats..."
curl -s $API_URL/users/$USER_ID/stats | jq '.stats'
echo ""

echo "5. Getting user territories..."
curl -s $API_URL/territories/user/$USER_ID | jq 'length'
echo " territories found"
echo ""

echo "6. Getting all badges..."
curl -s $API_URL/badges | jq 'length'
echo " badges available"
echo ""

echo "7. Getting leaderboard..."
curl -s $API_URL/users/leaderboard | jq '.'
echo ""

echo "✅ API test completed!"
echo ""
echo "📍 Open http://localhost:3000 in your browser for the interactive map"
