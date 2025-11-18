# Deployment Guide

This guide explains how to deploy the Neurastate monorepo to Google Cloud Platform.

## Prerequisites

- Google Cloud Project with billing enabled
- GitHub repository
- GCP Service Account with required permissions

## Required GCP Services

1. **Cloud Run** - For Next.js web application
2. **Cloud Functions** - For serverless handlers
3. **Artifact Registry** - For Docker images

## Setup Instructions

### 1. Create GCP Resources

```bash
# Set your project ID
export PROJECT_ID="your-project-id"

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudfunctions.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com

# Create Artifact Registry repository
gcloud artifacts repositories create neurastate \
  --repository-format=docker \
  --location=us-central1 \
  --description="Neurastate Docker images"

# Create Pub/Sub topics for Cloud Functions
gcloud pubsub topics create property-events
gcloud pubsub topics create market-data-updates
```

### 2. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com
```

### 3. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. `GCP_PROJECT_ID` - Your GCP project ID
2. `GCP_SA_KEY` - Contents of the `key.json` file

Go to: Repository Settings → Secrets and variables → Actions → New repository secret

### 4. Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build all packages
pnpm build

# Clean all build artifacts
pnpm clean
```

### 5. Environment Variables

Create `.env.local` in `apps/web`:

```env
# Copy from .env.example
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Deployment Process

### Automatic Deployment

Deployments are triggered automatically on push to `main` branch:

- **Web App**: Deployed to Cloud Run when files in `apps/web/` or `packages/shared/` change
- **Cloud Functions**: Deployed when files in `packages/cloud-functions/` change
- **CI**: Runs on all PRs and pushes

### Manual Deployment

Trigger workflows manually from GitHub Actions tab:

1. Go to Actions
2. Select workflow (e.g., "Deploy Web App to Cloud Run")
3. Click "Run workflow"
4. Select branch and run

### Docker Build Locally

```bash
# Build Docker image
docker build -f apps/web/Dockerfile -t neurastate-web .

# Run locally
docker run -p 8080:8080 neurastate-web
```

## Project Structure

```
neurastate/
├── apps/
│   └── web/              # Next.js application
├── packages/
│   ├── shared/           # Shared utilities and types
│   └── cloud-functions/  # Cloud Functions handlers
├── .github/
│   └── workflows/        # GitHub Actions workflows
└── turbo.json           # Turborepo configuration
```

## Monitoring

After deployment, monitor your services:

```bash
# Check Cloud Run service
gcloud run services describe neurastate-web --region us-central1

# View logs
gcloud run services logs read neurastate-web --region us-central1

# List Cloud Functions
gcloud functions list --gen2

# View function logs
gcloud functions logs read property-notifications --gen2 --region us-central1
```

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify `pnpm-lock.yaml` is committed
- Ensure `turbo.json` pipeline is correct

### Cloud Run Deployment Fails

- Verify service account has `roles/run.admin`
- Check Docker image was pushed successfully
- Review Cloud Build logs in GCP Console

### Cloud Functions Deployment Fails

- Ensure Pub/Sub topics exist
- Verify function entry points match exports
- Check function memory/timeout settings

## Cost Optimization

- Cloud Run scales to zero when not in use
- Set appropriate memory limits (512Mi for web app)
- Use minimum instances of 0 for development
- Monitor usage in GCP Billing dashboard

## Security

- Never commit `.env` files
- Rotate service account keys regularly
- Use Secret Manager for sensitive data in production
- Enable Cloud Armor for DDoS protection
- Set up VPC Service Controls for additional security
