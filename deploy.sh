#!/bin/bash

# SceneForge GCP Cloud Run Deployment Script

set -e

# Configuration
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-sceneforge-497904}"
SERVICE_NAME="sceneforge"
REGION="${GOOGLE_CLOUD_LOCATION:-us-central1}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  SceneForge GCP Cloud Run Deployment  ${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Please install the Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
echo -e "${YELLOW}Checking gcloud authentication...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo -e "${RED}Error: Not authenticated with gcloud${NC}"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Set project
echo -e "${YELLOW}Setting GCP project: ${PROJECT_ID}${NC}"
gcloud config set project ${PROJECT_ID}

# Build the container image
echo ""
echo -e "${YELLOW}Building container image...${NC}"
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${SERVICE_NAME}

# Deploy to Cloud Run
echo ""
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"

# Get database URL from environment or use default
DATABASE_URL="${DATABASE_URL:-}"

if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}Warning: DATABASE_URL not set. Using default Prisma Postgres.${NC}"
    echo -e "${YELLOW}Set DATABASE_URL environment variable for Cloud SQL.${NC}"
fi

gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${SERVICE_NAME} \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300s \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${PROJECT_ID}" \
  --set-env-vars "GOOGLE_CLOUD_LOCATION=${REGION}" \
  --set-env-vars "GEMINI_MODEL=gemini-2.5-pro"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!                  ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Service URL:"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)'
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Visit the service URL to test the application"
echo "2. Run database migrations if needed:"
echo "   npx prisma migrate deploy"
echo "3. Check logs with: gcloud logging read 'resource.type=cloud_run_revision'"
echo ""
