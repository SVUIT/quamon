#!/bin/bash
set -euo pipefail

# Arguments
ENDPOINT=$1
SITE_ID=$2
PROJECT_ID=$3
API_KEY=$4
DEPLOYMENT_ID=$5
MAX_ATTEMPTS=${6:-90}

# Validate inputs
if [ -z "$ENDPOINT" ] || [ -z "$SITE_ID" ] || [ -z "$PROJECT_ID" ] || [ -z "$API_KEY" ] || [ -z "$DEPLOYMENT_ID" ]; then
  echo "[FAILED] Missing required arguments"
  echo "Usage: $0 <endpoint> <site_id> <project_id> <api_key> <deployment_id> [max_attempts]"
  exit 1
fi

# Wait for deployment
for i in $(seq 1 $MAX_ATTEMPTS); do
  RESPONSE=$(curl -s "$ENDPOINT/sites/$SITE_ID/deployments/$DEPLOYMENT_ID" \
    -H "X-Appwrite-Project: $PROJECT_ID" \
    -H "X-Appwrite-Key: $API_KEY")

  STATUS=$(echo "$RESPONSE" | jq -r '.status')

  echo "Attempt $i/$MAX_ATTEMPTS - Status: $STATUS"

  if [ "$STATUS" = "ready" ]; then
    echo "[SUCCESS] Deployment ready"
    exit 0
  fi

  if [ "$STATUS" = "failed" ]; then
    echo "[FAILED] Deployment failed"
    echo "$RESPONSE"
    exit 1
  fi

  sleep 10
done

echo "[TIMEOUT] Timeout waiting for deployment (max $MAX_ATTEMPTS attempts)"
exit 1
