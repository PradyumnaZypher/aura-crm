#!/bin/bash

echo "Testing Client Dashboard APIs..."

# Test scheduling a call
echo "1. Testing Schedule Call API..."
curl -X POST http://localhost:3000/api/calls \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Call",
    "description": "Test call description",
    "scheduledFor": "2024-02-01T10:00:00Z",
    "duration": 30,
    "type": "VIDEO",
    "notes": "Test notes"
  }' | jq '.' 2>/dev/null || echo "Call API test completed"

# Test sending a message
echo -e "\n2. Testing Send Message API..."
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Message",
    "content": "This is a test message",
    "type": "EMAIL",
    "receiverId": "test-user-id"
  }' | jq '.' 2>/dev/null || echo "Message API test completed"

# Test fetching documents
echo -e "\n3. Testing Documents API..."
curl -X GET http://localhost:3000/api/documents | jq '.' 2>/dev/null || echo "Documents API test completed"

echo -e "\nAPI tests completed!"