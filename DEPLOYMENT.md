# SceneForge Deployment Guide

This guide will help you set up Google Cloud Vertex AI and PixVerse API for production deployment.

## Prerequisites

- Node.js 18+
- A Google Cloud account with billing enabled
- A PixVerse account with API access

---

## Step 1: Google Cloud Setup (Vertex AI)

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project selector (top left)
3. Click "New Project"
4. Name it "sceneforge" or any name you prefer
5. Click "Create"

### 1.2 Enable Vertex AI API

1. In the Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Vertex AI API"
3. Click on "Vertex AI API" in the results
4. Click "Enable"

### 1.3 Create a Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Name: "sceneforge-sa"
4. Click "Create and Continue"
5. Grant roles:
   - Vertex AI User
   - Service Account Token Creator
6. Click "Done"

### 1.4 Create and Download API Key

1. In the Service Accounts list, find "sceneforge-sa"
2. Click on it
3. Go to "Keys" tab
4. Click "Add Key" > "Create New Key"
5. Select "JSON"
6. Click "Create"
7. The JSON file will download - save it securely!

### 1.5 Set Environment Variable

The downloaded JSON file contains credentials. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to this file:

**Windows:**
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\sceneforge-sa-key.json"
```
