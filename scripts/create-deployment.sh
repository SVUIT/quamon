#!/bin/bash
set -euo pipefail

# Arguments
ENDPOINT=$1
SITE_ID=$2
PROJECT_ID=$3
API_KEY=$4
COMMIT_SHA=$5

# Validate inputs
if [ -z "$ENDPOINT" ] || [ -z "$SITE_ID" ] || [ -z "$PROJECT_ID" ] || [ -z "$API_KEY" ] || [ -z "$COMMIT_SHA" ]; then
  echo "[FAILED] Missing required arguments"
  echo "Usage: $0 <endpoint> <site_id> <project_id> <api_key> <commit_sha>"
  exit 1
fi

# Create deployment
RESPONSE=$(curl -s -X POST "$ENDPOINT/sites/$SITE_ID/deployments/vcs" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"commit\",
    \"reference\": \"$COMMIT_SHA\",
    \"activate\": false
  }")

echo "$RESPONSE" > res.json

DEPLOYMENT_ID=$(jq -r '."$id"' res.json)

if [ "$DEPLOYMENT_ID" = "null" ] || [ -z "$DEPLOYMENT_ID" ]; then
  echo "[FAILED] Failed to create deployment"
  cat res.json
  exit 1
fi

echo "deployment_id=$DEPLOYMENT_ID"
